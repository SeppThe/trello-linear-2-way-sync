import { Hono } from "hono";

const trelloRoutes = new Hono();

trelloRoutes.post("/", (c) => {
    const body = c.req.json();

    console.log("Received Trello webhook:", body);
    
    return c.json({ ok : true });
})


export default trelloRoutes;