import { Hono } from "hono";

const linearRoutes = new Hono();

linearRoutes.post("/", (c) => {
    const body = c.req.json();

    console.log("Received Linear webhook:", body);
    
    return c.json({ ok : true });
})


export default linearRoutes;