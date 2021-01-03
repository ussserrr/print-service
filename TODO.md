# TODO

 - [±] check against the most strict TS configuration
 - [ ] return `leftJoin`ed `FindOne`s
 - [ ] logging (debug/dev/prod mode)
 - [ ] check DB relations again (uniq `currentFile`s, etc.)
 - [ ] check dates (emulate another timezone)
 - [+] customize exception messages (coming from GraphQL, TypeORM)
 - [ ] pass relations when needed and handle in resolvers
 - [ ] throw errors where needed
 - [ ] limit available file types (and names, e.g. OS-reserved ones)
 - [ ] handle cases when the file was removed outside of the app/DB (i.e. directly in filesystem)
 - [ ] reset `package-lock.json` in the end (as we're messing with Node versions)
 - [ ] limit number of files on the drive (check for creation and update)
 - [ ] TypeOrm entity validation, too (class-validator)
 - [ ] Test multiple mutations at the same time (including same ones (e.g. update after update))
