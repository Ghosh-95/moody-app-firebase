# Getting Started

Install the dependencies and run the project

```bash
npm install
npm run dev
```

Head over to [https://vitejs.dev/](Vite) to learn more about configuring vite.

When we fetch data from a particular collection in the database, it returns a querySnapshot object that contains different info about the collectinos. And if we loop through the querySnapshot we get a special object `doc` which includes different field about the document such as id, data (contains different fields from the collection) etc.

`onSnapshot`: It is like a event listener which listens to update in the database and runs the code in Realtime. It runs everytime there is any changes in the databases.

There might be sometime when you need no logner listening to changes in database, then you must detach the listener. In those case, just assign a variable to the onSnapshot function and call it wherever you need to stop listening to changes.

```js
import { collection, onSnapshot } from "firebase/firestore";

const unsubscribe = onSnapshot(collection(db, "cities"), () => {
  // Respond to data
  // ...
});

// Later ...

// Stop listening to changes
unsubscribe();
```

## Security Rules

Security Rules are simple rules that lets us write simple rules in Common Expression Language, that acts like a wall between client and database. Data can pass through the wall only if it satisfy certain security rules.

With each post there is a request sent to the firebase. With each request, there is a object named 'auth' among many other useful elements. That auth object has two states: it can either be *null* when the user is un-authenticated or contain an object that has information on the authenticated user.

Firebase provides a **resourse** keyword that contains additional info about a user that is currently active. We can use these to write proper security rules for our apps.

## Queries

Queries lets you fetch data from cloud firestore based on specific criteria. It helps us to fetch only what we need, not the entire collection of data.

The where() method takes three parameters: a field to filter on, a comparison operator, and a value. Cloud Firestore supports the following comparison operators:

```txt
< less than
<= less than or equal to
== equal to
> greater than
>= greater than or equal to
!= not equal to
array-contains
array-contains-any
in
not-in
```
