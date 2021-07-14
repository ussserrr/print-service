# TODOs list
 - [±] check against the most strict TS configuration
 - [ ] use `leftJoin` for `FindOne`s?
 - [ ] check dates (emulate another timezone)
 - [ ] handle cases when the file was removed outside of the app/DB (i.e. directly in filesystem) (or store as BLOBs in the DB itself)
 - [ ] TypeOrm entity validation, too (class-validator)?
 - [ ] Test multiple mutations at the same time (including same ones (e.g. update after update))
 - [ ] Check/set requests timeouts (both REST/GraphQL)
 - [ ] Translate errors, warnings so the client can display them to end-user (e.g. TypeORM errors shouldn't be exposed actually... In theory, we should catch them anyway, and so then we can throw custom (and therefore translated) messages)
 - [ ] Maybe detect that this template has been printed with this data already so return from cache (i.e. store the hash)
 - [±] Replace as much strings in code as possible (by enums or smth) (like resolvers names, 'print', etc.)
 - [ ] Authorization
 - [ ] Check field name for sortBy in calss-validator (e.g. Object.keys(Entity) or smth)
 - [ ] Check for duplicate titles/names on create/update
 - [ ] Do not join `currentFile` if it was not requested (utilize GraphQL advantage)
 - [ ] Why separate find/findOne
 - [ ] Use cluster-level monitoring tools (such as Prometheus). We can gather metrics about templates usage and so on
 - [ ] Authorization
 - [ ] Define pagination as type, not generic container, and compose it into the response, e.g.
  ```
  {
      id
      title
      files[] {
          id
          title
      }
      filesPagination {
          limit
          offset
          total
          ...
      }
  }
  ```
 - [ ] Ability to provide service config from outside and change settings at runtime (in other words, every new change of config should not issue a new release)

## TemplateField entity design preview:
 - `key/name/value` (for docxtemplater or other templating engine)
 - `title/description` (human-readable)
 - `isRequiredForFile` (let us check the field placeholder presence when uploading a new TemplateFile)
 - `isRequiredForPrint` (check whether it was given on print request)
 - `manualInput` (whether this field should be manually filled by a user on every print)
 - `size` (symbol space occupied, useful for placeholders like ________)
 - `type` (number, FullName) (allowing different words forms)
 - relations with TemplateFiles, TemplateTypes

