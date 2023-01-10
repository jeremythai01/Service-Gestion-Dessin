import "reflect-metadata";
import { containerBootstrapper } from "./inversify.config";
import { Server } from "./server";
import { TYPES } from "./const/types";
import { Container } from "inversify";

void (async () => {
    const container: Container = await containerBootstrapper();
    const server: Server = container.get<Server>(TYPES.Server);

    server.init();
})();
