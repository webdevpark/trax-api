# jobs-api

This application is the backend service api for the **Trax** project. All requests for data from Trax or any dependencies are expected to flow through this application.

## Database

### trax (Control database)

In order to perform a generation of the database, the solution first requires the sequelize template. In accordance with [these instructions](http://www.pg-generator.com/builtin-templates/sequelize/), this template can be downloaded with the following:

```
pgen template sequelize -t sequelize-template
```

After this template is downloaded and it available to your application, you can use the custom npm action called `regen`. `regen` will re-run the database generation process, which generates model classes/modules. To invoke this custom script, you use the following:

```
npm run-script regen
```

The `regen` run script itself may require update, depending on where your database is running from and what the username/password pair is. Check the `package.json` for further details on this:

```
"regen": "node_modules/.bin/pgen exec sequelize-template --host 172.17.42.1 -d trax -u postgres -p password -t dao/ctrl"
```

