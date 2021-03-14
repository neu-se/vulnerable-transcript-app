// app-specific packages
import * as db from '../types/local-transcript-manager';

import { app } from './server';

// the port to listen on
const inputPort = process.env.PORT || 4001;

// initializes the server
function intitalizeServer() {
  db.initialize();   // initialize the database
  console.log('Initial list of transcripts:');
  console.log(db.getAll());
  console.log(`Express server now listening on localhost:${inputPort}`);
}


// start the server listening on 4001
export const server = app.listen(inputPort, intitalizeServer);
