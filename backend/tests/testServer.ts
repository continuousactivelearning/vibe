import 'reflect-metadata';
import {createExpressServer, useContainer} from 'routing-controllers';
import {Container} from 'typedi';
import {ItemController} from '../src/modules/courses/controllers/ItemController';
import {app} from '../testServer';

useContainer(Container);

export const server = createExpressServer({
  controllers: [ItemController],
});

app.use(server);
