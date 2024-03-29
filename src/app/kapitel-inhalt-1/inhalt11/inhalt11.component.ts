import { Component, OnInit } from '@angular/core';

import {AngularFireDatabase} from '@angular/fire/compat/database';
import {Observable, take} from 'rxjs';

export interface Inhalt11Data {
  id: number;
  keyValuePairs: KeyValue<any, any>[];
  stage: number;
  aufgaben: string[];
}

export interface KeyValue<a, k> {
  key: a;
  value: k;
}

@Component({
  selector: 'app-inhalt11',
  templateUrl: './inhalt11.component.html',
  styleUrls: ['./inhalt11.component.scss']
})
export class Inhalt11Component implements OnInit {
  displayedColumns: string[] = ['key', 'value'];
  inhalt: Observable<any> = this.db.object('/inhalt/inhalt11').valueChanges();
  dataSource: KeyValue<any, any>[] = [];
  currenSelection = 'create';
  inputValue = '{key}:{value}';
  message: any;
  stage: number = 0;
  dC = false;
  dR = false;
  dU = false;
  dD = false;
  currentAufgabe = '';

  constructor(public db: AngularFireDatabase){}

  ngOnInit(): void {
    this.inhalt.subscribe(val => {
      const data: Inhalt11Data = val;
      this.dataSource = Object.entries(data.keyValuePairs).map(value => value[1]);
      this.stage = Number(data.stage);
      this.currentAufgabe = data.aufgaben[this.stage];
      this.processStatus();
    });
  }

  public processStatus(): void {
    if (this.dC && this.dR && this.dU && this.dD && this.stage < 1) {
      this.stage = 1;
      this.db.object('/inhalt/inhalt11/stage/')
        .set(this.stage);
    }
  }

  public setInputHints(evt: any): void {
    switch (evt.value) {
      case 'create' : this.inputValue = '{key}:{value}'; break;
      case 'read' : this.inputValue = '{key}'; break;
      case 'update' : this.inputValue = '{key}:{value}'; break;
      case 'delete' : this.inputValue = '{key}'; break;
      default: break;
    }
  }

  public createFirebaseRequest(): void {
    switch (this.currenSelection) {
      case 'create' : this.firebaseCreate(this.inputValue.split(':')[0], this.inputValue.split(':')[1]); break;
      case 'read' : this.firebaseRead(this.inputValue); break;
      case 'update' : this.firebaseUpdate(this.inputValue.split(':')[0], this.inputValue.split(':')[1]); break;
      case 'delete' : this.firebaseDelete(this.inputValue); break;
      default: break;
    }
  }

  private firebaseCreate(keyValue: string, nodeValue: string): void {
    if (!keyValue || !nodeValue || this.dataSource.find(val => val.key.toString() === keyValue)) {
      this.message = 'Fehlerhafte Eingabe oder Schlüssel bereits vorhanden!';
      return;
    }
    this.db.object('/inhalt/inhalt11/keyValuePairs/' + keyValue)
      .set({ key: keyValue, value: nodeValue });
    this.message = 'Erfolgreich Create ausgeführt.';
    this.dC = true;
  }

  private firebaseRead(keyValue: string = null): void {
    if (!keyValue) {
      this.message = 'Fehlerhafte Eingabe!';
      return;
    }
    this.db.object('/inhalt/inhalt11/keyValuePairs/' + keyValue)
      .valueChanges().pipe(take(1)).subscribe(result => this.message = 'Ergebnis: ' + JSON.stringify(result));
    this.dR = true;
  }

  private firebaseUpdate(keyValue: string = null, nodeValue: string = null): void {
    if (!keyValue || !nodeValue || !this.dataSource.find(val => val.key.toString() === keyValue)) {
      this.message = 'Fehlerhafte Eingabe oder Datensatz nicht vorhanden!';
      return;
    }
    this.db.object('/inhalt/inhalt11/keyValuePairs/' + keyValue)
      .update({ key: keyValue, value: nodeValue });
    this.message = 'Erfolgreich Update ausgeführt.';
    this.dU = true;
  }

  private firebaseDelete(keyValue: string = null): void {
    if (!keyValue || !this.dataSource.find(val => val.key.toString() === keyValue)) {
      this.message = 'Fehlerhafte Eingabe oder Datensatz nicht vorhanden!';
      return;
    }
    this.db.object('/inhalt/inhalt11/keyValuePairs/' + keyValue).remove();
    this.message = 'Erfolgreich Delete ausgeführt.';
    this.dD = true;
  }
}
