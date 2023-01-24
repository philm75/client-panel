import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, of } from 'rxjs';
import { Client } from '../models/Clients';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  clientsCollection: AngularFirestoreCollection<Client>;
  clientDoc: AngularFirestoreDocument<Client>;
  clients: Observable<Client[]>;
  client: Observable<Client>;

  constructor(private afs: AngularFirestore) { 
    this.clientsCollection = this.afs.collection('clients', ref => ref.orderBy('lastName'));
  }

  getClients(): Observable<Client[]> {
    let theClients: Client[] = [];
    this.clientsCollection.snapshotChanges().forEach(client => {
      client.forEach(action => {
        const data = action.payload.doc.data() as Client;
        data.id = action.payload.doc.id;
        theClients.push(data);
      })
    });
    return of(theClients);
  }

  newClient(client: Client) {
    this.clientsCollection.add(client);
  }

  getClient(id: string): Observable<Client> {
    this.clientDoc = this.afs.doc<Client>(`clients/${id}`);
    this.client = this.clientDoc.snapshotChanges()
                      .pipe(
                          map(action => {
                            if (action.payload.exists === false) {
                              return null;
                            } else {
                              const data = action.payload.data() as Client;
                              data.id = action.payload.id;
                              return data;
                            }
                          })
                      );
    return this.client;
  }

  updateClient(client: Client) {
    this.clientDoc = this.afs.doc(`clients/${client.id}`);
    this.clientDoc.update(client);
  }

  deleteClient(client: Client) {
    this.clientDoc = this.afs.doc(`clients/${client.id}`);
    this.clientDoc.delete();
  }  
}