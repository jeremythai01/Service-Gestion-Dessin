import { Container } from 'inversify';
import * as sinon from 'sinon';
import { containerBootstrapper } from "../app/inversify.config";

let sandbox: sinon.SinonSandbox | undefined;
let c: Container | undefined;

export const testingContainer: () => Promise<[Container, sinon.SinonSandbox]> = async () => {
    sandbox = sinon.createSandbox();
    c = await containerBootstrapper();
    // Insert all container rebinds necessary to all test contexts here.
    return [c, sandbox];
};

afterEach(() => {
    if (sandbox) {
        sandbox.reset();
        sandbox = undefined;
    }

    if (c) {
        c.unbindAll();
        c = undefined;
    }
});

export type Stubbed<T> = T &
    {
        [keys in keyof T]: sinon.SinonStub;
    };
