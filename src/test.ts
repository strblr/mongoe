import { ObjectId } from "mongodb";
import { Database, Schema } from ".";

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

async function test() {
  const db = new Database("mongodb://localhost:27017", "mongoe");

  const Author = db.collection<Author>("Author");

  const Book = db.collection<Book>("Book", {
    async Author(document: Author, operation: string) {
      if (operation === "DELETE")
        await Book.deleteMany({ author: document._id });
    }
  });

  console.log(await Author.countDocuments());

  process.exit();
}

test();
