import { ObjectId } from "mongodb";
import { Database, Policy } from ".";

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

  const Author = db.collection<Author>("Author");
  const Book = db.collection<Book>("Book", {
    foreignKeys: {
      author: {
        collection: "Author",
        policy: Policy.Delete
      }
    }
  });

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

  const Element = db.collection<Element>("Element");
  const Parameter = db.collection<Parameter>("Parameter", {
    foreignKeys: {
      element: {
        collection: "Element",
        policy: Policy.Nullify
      }
    }
  });

  process.exit();
}

test();
