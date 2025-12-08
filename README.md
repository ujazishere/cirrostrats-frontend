## License

This project is licensed under the **Elastic License 2.0 (ELv2)**.

You may use, modify, and redistribute this software under the terms of the Elastic License 2.0.
You may **not** provide this software to third parties as a hosted or managed service that exposes
a substantial set of its features or functionality. See `LICENSE.txt` and
https://www.elastic.co/licensing/elastic-license for full details.


# One of two ways to do this:

**A: Docker container(spools up frontend, backend and nginx using docker:) - Most efficient and Full-Featured:**

**OR**

**B: Without docker(Spool up just the frontend) - React JS**

## A: Docker container(spools up frontend, backend and nginx using docker:) - Most efficient and Full-Featured:

1. **Clone the base repo:** [https://github.com/Cirrostrats/base](https://github.com/Cirrostrats/base)

2. **Follow instructions in `base/README.md`**

## B: Without docker(Spool up just the frontend) - React JS\*\*

**Copy contents of `.env.example` and paste it in `.env` file at root.**

1. **Running the Frontend:**

   a. **Install the dependinces - run `npm install`**

   b. **Run Development Server:**

   ```bash
   npm run dev
   ```

   c. **Access the Frontend:** The frontend runs on [http://localhost:5173/](http://localhost:5173/).

   d. **The backend for this project is at the following repo :**
   https://github.com/ujazishere/cirrostrats-backend/

**dev notes:**
Ensure following code is within package.json to allow other networks/containers to listen to the project when running the project on an isolated container.

```bash
  "scripts": {
    "dev": "vite --host 0.0.0.0",
```
