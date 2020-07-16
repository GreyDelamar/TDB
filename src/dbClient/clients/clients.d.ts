interface queryRow {
  [key: string]: any
}

interface queryResults {
  localRanAt: Date;
  optput?: object // seems to be empty most of the time
  recordset?: Array<queryRow> // not reall needed
  recordsets: [ [ queryRow ] ] // should be like this
  rowsAffected?: [] // count of rows affected
}