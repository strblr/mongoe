import { ObjectId } from "mongodb";
import { Collection, Database } from ".";

async function test() {
  const db = new Database("mongodb://localhost:27017", "mongoe_test");
  await db.dropDatabase();

  // First example

  console.log("-- The Author - Book example --");

  type Author = {
    _id: ObjectId;
    name: string;
    age: number;
  };

  type Book = {
    _id: ObjectId;
    title: string;
    author: ObjectId;
  };

  const Author = new Collection<Author>(db, "Author");
  const Book = new Collection<Book>(db, "Book");

  console.log("Inserting many authors...");
  const [king, crichton, obertone] = await Author.insertMany([
    { name: "Steven King", age: 64 },
    { name: "Michael Crichton", age: 54 },
    { name: "Laurent Obertone", age: 46 }
  ]);
  console.log([king, crichton, obertone]);
  console.log("Inserting one author...");
  console.log(await Author.insertOne({ name: "George Lucas", age: 70 }));

  // Second example

  console.log("-- The Element - Parameter example --");

  type Element = {
    _id: ObjectId;
    label: string;
  };

  type Parameter = {
    _id: ObjectId;
    label: string;
    element: ObjectId | null;
  };

  const Element = new Collection<Element>(db, "Element");
  const Parameter = new Collection<Parameter>(db, "Parameter");

  // End

  process.exit();
}

test();
