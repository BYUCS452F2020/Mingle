# Mingle Server

## Description

The Mingle server handles the back-end work of the Mingle mobile application.

## Setup

### Local

To set up the Mingle server locally, use the following steps:

1. Install Node and NPM on the system.
2. Run the command `npm install` to install the server's external dependencies.
3. Create a config.json file with appropriate settings for your environment. The
`config.json` should be places in `/path/to/Mingle/mingle_server/config.json`. Config
file format is given in the configuration section below.

4. To run the server, execute `npm run start`. For testing, run `npm run test`*.

\* Running the server with the test script will run the server with the `Nodemon`
package which allows for hot reloading of the server without having to stop and start
it again.

### Remote

If we get a droplet or other server, the deployment instructions can go here.

##Configuration

The configuration file is a json formatted file containing various parameters that can
be configured depending on the environment. If a parameter has a default value, then it
will be set to the default if it is not included in the configuration file. A full example 
is given below the parameter table.

| Parameter Name | Type | Default | Description |
| :------------------------ | :------ | :---- | :---------- |
| server.port               | Int     | 4000  | The port you want the server to listen on. |
| log.level                 | String  | debug | The log level you want to display. |
| log.file                  | Path    |       | The path to the log file you want to output. |
| database.host             | String  |       | Hostname of the server the database runs on. |
| database.port             | Int     |       | The port you want the server to listen on. |
| database.user             | String  |       | Username on the database you are accessing. |
| database.password         | String  |       | Password on the database for the user you are accessing. |
| database.database         | String  |       | Name of the database. |
| storage.imageStoragePath  | String  |       | Path to directory where images are stored. |

#### Example Configuration File

```
{
    "server": {
        "port": 4000
    },
    "log": {
        "level": "debug",
        "file", "/path/to/test.log"
    },
    "database": {
        "host": "hostnameofdatabaseserver",
        "port": 8000,
        "user": "username",
        "password": "password",
        "database": "Mingle"
    },
    "storage": {
        "imageStoragePath": "uploads"
    }
}
```
