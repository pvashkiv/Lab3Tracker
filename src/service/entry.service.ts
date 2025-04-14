import {DbService} from './db.service.ts';

export type EntryFields = {
  startTime: string;
  endTime: string;
  duration: number;
};

export type Entry = {
  id: number;
} & EntryFields;

export class EntryService {
  static async getAll(): Promise<Entry[]> {
    return await DbService.select('SELECT * FROM entries ORDER BY id DESC');
  }

  static async create(entry: EntryFields) {
    await DbService.promisify(
      'INSERT INTO entries (startTime, endTime, duration) VALUES (?, ?, ?)',
      [entry.startTime, entry.endTime, entry.duration],
    );
  }

  static async delete(id: number) {
    await DbService.promisify('DELETE FROM entries WHERE id = ?', [id]);
  }
}
