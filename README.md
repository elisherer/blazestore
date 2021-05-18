## Blazestore
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/elisherer/blazestore/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/elisherer/blazestore/pulls)
<img src="./docs/blazestore.svg" alt="Blazestore logo" align="right" width="20%"/>


GUI for Firestore Admin SDK (inspired by the official firestore console)

### Usage

- Clone this repository
- Throw your service account JSON file into `/server/credentials`
  - IMPORTANT: Your files will be ignored by Git (there is a `.gitignore` file in there)
  - See instructions below how to obtain a service account
- Create another `.env` file (same folder).

e.g. `.env` (in addition to `my-app-service-account-af2cb2364.json`)
```sh
# default is 3030
#SERVER_PORT=

FIRESTORE_DATABASE_URL="https://my-project.firebaseio.com"

GCLOUD_AUTH_TYPE="service_account"
GCLOUD_PROJECT="my-project"

#GCLOUD_AUTH_TYPE=oauth2
# override the default redirect url (default is the first one)
#OAUTH2_REDIRECT_URL=
```
- Install dependencies `npm install`
- Run the app by `npm start`
- Open browser on `http://localhost:3030`

### How to create a service account

1. Go to [Firebase console](https://console.firebase.google.com/)
2. Open your project's settings.
3. At the "Service accounts" tab, click the "Generate new private key" (Node.js chosen)

![create_service_account](./docs/create_service_account.png)

### Update documents fields syntax

|Value format|Argument|Translates to|Description|Example|
|------------|---------|-------------|-----------|-------|
|`"$id"`     |  None   | `path.split('/').pop()`|Gets the current document id (last part of the path)|`"key": "$id"`
|`"$path"`   |  None   | `path`|Gets the current document path|`"current_path": "$path"`
|`"$path<n>"`|  None   | `path.split('/')[n]`|Gets the Nth part of current document path|`"root_collection": "$path0"`
|`"$ref:/..."`| Path to a document (can contain `$path<n>?` placeholders) | `firestore.doc("/...")`| `DocumentReference` type value| `"related_doc": $ref:/$path0/$path1/sibling-coll/doc-1"`
|`"$time:<millis/ISO>"`|`millis` = Milliseconds since UNIX epoch OR `ISO` = ISO-8601 format. |`Timestamp.fromDate(new Date(...))`|`Timestamp` type value|`"action_time": $time:1609459200000"` / `$time:2021-01-01T00:00"`
|`"$serverTime()"`|None|`FieldValue.serverTimestamp()`|`Timestamp` of write time on server|`"created_at": "$serverTime()"`
|`["$geo", <la>, <lo>]`|Latitude and Longitude (float)|`new GeoPoint(<la>,<lo>)`|`GeoPoint` type value|`"ip_location": ["$geo", 34, 40]`
|`"$inc:<by>"`|Number (float or int)|`FieldValue.increment(<by>)`|Increments (or decrements for negative values) the existing value (or adding to 0)|`"count": "$inc:1"`
|`["$union", ...]`|any[]|`FieldValue.arrayUnion(...)`|Add the following items to the existing array (create one if not an array)| `"likes_by": ["$union", "$ref:/..."]`
|`["$remove", ...]`|any[]|`FieldValue.arrayRemove(...)`|Remove the following items from the existing array|`"flags": ["$remove", 2]`
|`"$delete"`|None|`FieldValue.delete()`|Mark this field for deletion (on update only)| `"to_be_deleted": "$delete"`

![syntax](./docs/update_doc.png)