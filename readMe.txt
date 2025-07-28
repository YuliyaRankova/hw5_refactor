The issue in the code was that the data didn’t have enough time to be written to the file when the server
was shutting down. As a result, all the work done with users couldn’t be saved.

What needed to be done:

1)Make the saveDataToFile() method asynchronous so that data can be written to the file before the server shuts down.

2)In the "SIGINT" event, make sure to wait for the write operation to complete:
await userService.saveDataToFile();

3)Make the restoreDataFromFile() method asynchronous so that data is loaded from the file before the server starts
handling requests.

4)At the start of the application, wait for the data to load from the file before starting the server:
await userService.restoreDataFromFile();