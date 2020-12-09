import { ObjectId } from "mongodb";
import { Collection, Database, Policy } from ".";

async function test() {
  const db = new Database("mongodb://localhost:27017", "mongoe_test");
  await db.dropDatabase();

  // First example

  console.log("-- The Author example --");
  console.log("Setting Author, Book and Sale collections and relations...");

  const Author = new Collection<{
    _id: ObjectId;
    name: string;
    age: number;
  }>(db, "Author");

  const Book = new Collection<{
    _id: ObjectId;
    title: string;
    author: ObjectId;
  }>(db, "Book", {
    foreignKeys: {
      author: ["Author", Policy.Delete]
    }
  });

  const Sale = new Collection<{
    date: string;
    customer: string;
    book: ObjectId;
  }>(db, "Sale", {
    foreignKeys: {
      book: ["Book", Policy.Delete]
    }
  });

  console.log("Relations :", db.relations);

  console.log("Inserting many authors...");
  const [king, crichton, obertone] = await Author.insertMany([
    { name: "Steven King", age: 64 },
    { name: "Michael Crichton", age: 54 },
    { name: "Laurent Obertone", age: 46 }
  ]);
  console.log([king, crichton, obertone]);

  console.log("Inserting one author...");
  const lucas = await Author.insertOne({ name: "George Lucas", age: 70 });
  console.log(lucas);

  console.log("Inserting a book from George Lucas...");
  const starWars1 = await Book.insertOne({
    title: "Star Wars 1",
    author: lucas._id
  });
  console.log(starWars1);

  console.log("Inserting three books from Crichton...");
  const [prey, next, disclosure] = await Book.insertMany([
    { title: "Prey", author: crichton._id },
    { title: "Next", author: crichton._id },
    { title: "Disclosure", author: crichton._id }
  ]);
  console.log([prey, next, disclosure]);

  console.log("Inserting two books from King...");
  const [carrie, thinner] = await Book.insertMany([
    { title: "Carrie", author: king._id },
    { title: "Thinner", author: king._id }
  ]);
  console.log([carrie, thinner]);

  console.log("Inserting some sales...");
  const [s1, s2, s3, s4] = await Sale.insertMany([
    {
      date: new Date().toISOString(),
      customer: "Pierre Jacques",
      book: prey._id
    },
    {
      date: new Date().toISOString(),
      customer: "Henri Dupond",
      book: starWars1._id
    },
    {
      date: new Date().toISOString(),
      customer: "Guillaume Jean",
      book: carrie._id
    },
    {
      date: new Date().toISOString(),
      customer: "Martin Hubert",
      book: next._id
    }
  ]);
  console.log([s1, s2, s3, s4]);

  console.log("Deleting Crichton from Author...");
  await Author.deleteOne({ _id: crichton._id });

  /*console.log("Retrieving all remaining books...");
  console.log(await Book.find({}));*/

  // Second example

  /*console.log("-- The Element - Parameter example --");

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

  const Parameter = new Collection<Parameter>(db, "Parameter", {
    relation: {
      foreignKeys: {
        element: [Element, Policy.Nullify]
      }
    }
  });*/

  // End

  console.log("Done.");
  process.exit();
}

test();
