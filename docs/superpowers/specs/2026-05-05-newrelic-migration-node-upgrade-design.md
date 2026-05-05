# Design — Migration New Relic + montée de version Node

**Date:** 2026-05-05

## Contexte

Le projet envoie des métriques d'usage (compteurs et timers) via statsd UDP. Il tourne sur Node 14 (AWS Lambda). L'objectif est de migrer vers New Relic en 3 PRs indépendantes et progressives.

## PR1 — `feat/newrelic-metrics-node14` (base: master)

### Objectif
Remplacer l'envoi statsd par New Relic sans changer la version Node ni l'API interne.

### Contrainte de compatibilité
`newrelic@10.x` est la dernière version supportant Node 14 (`^10.6.2`).

### Approche
- Conserver la signature `sendStatsd(string)` dans tous les call sites (4 fichiers : `index.js`, `domoticzApiHelper.js`, `domoticz.js`, `config/database.js`)
- Modifier uniquement l'implémentation de `config/metrics.js`
- Parser le format statsd pour router vers la bonne API NR :
  - `"name:1|c"` → `newrelic.incrementMetric('Custom/name', 1)`
  - `"name:123|ms"` → `newrelic.recordMetric('Custom/name', 123)`
- `require('newrelic')` doit être le **premier require** de `index.js` (contrainte de l'agent)

### Fichiers modifiés
| Fichier | Changement |
|---------|-----------|
| `config/metrics.js` | Nouvelle implémentation NR, suppression code statsd/TCP |
| `index.js` | `require('newrelic')` en première ligne |
| `newrelic.js` | Nouveau — config agent (app name, license key, distributed_tracing) |
| `package.json` | Ajout `newrelic@^10.6.2` |
| `.env.dist` | Ajout `NEW_RELIC_LICENSE_KEY`, `NEW_RELIC_APP_NAME` |
| `serverless.yml` | Ajout `newrelic.js` dans `package.include` |

### Métriques envoyées
| Call site | Métrique statsd actuelle | Équivalent NR |
|-----------|--------------------------|---------------|
| `index.js:19` | `request.{namespace}.{name}:1\|c` | `incrementMetric('Custom/request/{namespace}/{name}')` |
| `index.js:160` | `request.{namespace}.{name}:{ms}\|ms` | `recordMetric('Custom/request/{namespace}/{name}', ms)` |
| `domoticzApiHelper.js:52` | `calls.answer.{name}:1\|c` | `incrementMetric('Custom/calls/answer/{name}')` |
| `domoticz.js:133` | `calls.command.{subtype}:1\|c` | `incrementMetric('Custom/calls/command/{subtype}')` |
| `config/database.js:51` | `calls.database.getUserData:1\|c` | `incrementMetric('Custom/calls/database/getUserData')` |

---

## PR2 — `feat/node-upgrade` (base: master)

### Objectif
Passer sur Node 22, en garantissant que les données existantes chiffrées en BDD restent déchiffrables.

### Problème cipher
`crypto.createCipher` et `crypto.createDecipher` ont été **supprimés en Node 22**. L'actuel `config/security.js` les utilise avec `aes192`.

### Solution : EVP_BytesToKey
Ces APIs utilisaient en interne `EVP_BytesToKey` (OpenSSL) avec MD5, 1 itération, sans salt. En réimplémentant cette dérivation de clé, on obtient exactement les mêmes clé et IV — rendant les données existantes déchiffrables à l'identique.

```
Pour aes192 : keyLen=24, ivLen=16
D_0 = MD5(password)
D_1 = MD5(D_0 + password)
D_2 = MD5(D_1 + password)
key = [D_0 + D_1 + D_2][0:24]
iv  = [D_0 + D_1 + D_2][24:40]
```

Ensuite : `createCipheriv('aes192', key, iv)` / `createDecipheriv('aes192', key, iv)`.

### Bug corrigé au passage
Dans le code actuel, l'objet `cipher` est créé **une seule fois** au chargement du module. Après le premier appel à `cipher.final()`, il est finalisé et inutilisable. La nouvelle implémentation crée un cipher par appel à `encrypt()`.

### Tests (fichier `test/__tests__/test_cipher.js`)
1. Round-trip : `decrypt(encrypt(data)) === data`
2. Compatibilité backward : déchiffrer une valeur de référence pré-calculée représentant une donnée existante en BDD

### Mises à jour packages
| Package | Avant | Après | Raison |
|---------|-------|-------|--------|
| `jest` | `^25.1.0` | `^29.0.0` | jest 25 ne supporte pas Node 22 |
| `serverless` | `^1.65.0` | inchangé | utilisé uniquement pour le deploy |

### Fichiers modifiés
| Fichier | Changement |
|---------|-----------|
| `serverless.yml` | `nodejs14` → `nodejs22` |
| `config/security.js` | `evpBytesToKey` + `createCipheriv`/`createDecipheriv` |
| `package.json` | jest 25 → 29, ajout `engines.node >= 22` |
| `test/__tests__/test_cipher.js` | Nouveau — tests cipher |

---

## PR3 — `feat/newrelic-metrics-node22` (base: PR2)

### Objectif
Ajouter New Relic avec la dernière version, possible grâce au Node 22 de PR2.

### Différence avec PR1
Uniquement la version du package : `newrelic@^13` au lieu de `@^10`. L'API `incrementMetric`/`recordMetric` est stable entre les deux versions. Le reste est identique à PR1.

### Fichiers modifiés
Mêmes que PR1 (la branche ne contient pas PR1, donc ajout complet depuis PR2).

---

## Décisions clés

- **Pas de changement des call sites** : `sendStatsd(string)` reste l'API interne. Moins de diff, plus facile à relire.
- **Pas de Lambda Extension NR** : l'agent `newrelic` gère le cycle de vie Lambda nativement depuis v8. Pas d'infrastructure supplémentaire.
- **Pas de migration de schéma de chiffrement** : l'objectif de PR2 est la compatibilité Node, pas l'amélioration de la sécurité du chiffrement. EVP_BytesToKey conserve le comportement exact.
- **Tests cipher uniquement** : les tests existants (snapshots Alexa discovery/commands) couvrent déjà les flux métier. On ajoute uniquement les tests sur le code modifié (cipher).
