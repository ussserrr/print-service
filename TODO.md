# TODOs list

 - [±] check against the most strict TS configuration
 - [ ] use `leftJoin` for `FindOne`s?
 - [x] logging (debug/dev/prod mode)
 - [x] check DB relations again (uniq `currentFile`s, etc.)
 - [ ] check dates (emulate another timezone)
 - [x] customize exception messages (coming from GraphQL, TypeORM)
 - [x] limit available file types (and names, e.g. OS-reserved ones)
 - [ ] handle cases when the file was removed outside of the app/DB (i.e. directly in filesystem)
 - [ ] reset `package-lock.json` in the end (as we're messing with Node versions (and to upgrade as well))
 - [x] limit number of files on the drive (check for creation and update)
 - [ ] TypeOrm entity validation, too (class-validator)?
 - [ ] Test multiple mutations at the same time (including same ones (e.g. update after update))
 - [ ] Check/set requests timeouts (both REST/GraphQL)
 - [x] *Maybe* somehow declare a proper Resolver' interface (with context and references to the original interface...)
       https://stackoverflow.com/a/52294058/7782943
       https://stackoverflow.com/questions/60067100/why-is-the-infer-keyword-needed-in-typescript
       IMPORTANT! We can actually inject the context "globally" (on resolver/service level) - https://docs.nestjs.com/fundamentals/injection-scopes. Or (probably better) we can implement a proper standalone middleware (interceptor or smth) that takes service' return value in form `[result, [warnings]]` and attaches an array to the context's property
 - [ ] Translate errors, warnings so the client can display them to end-user (e.g. TypeORM errors shouldn't be exposed actually... In theory, we should catch them anyway, and so then we can throw custom (and therefore translated) messages)
 - [ ] Maybe detect that this template has been printed with this data already so return from cache (i.e. store the hash)
 - [ ] Replace as much strings as possible (by enums or smth) (like resolvers names, 'print', etc.)
 - [x] Build a dependency graph (to analyze usage, docs)
 - [ ] Authorization
 - [ ] Check field name for sortBy in calss-validator (e.g. Object.keys(Entity) or smth)
 - [x] Add createdAt/updatedAt for TemplateType? (e.g. for list sorting)
