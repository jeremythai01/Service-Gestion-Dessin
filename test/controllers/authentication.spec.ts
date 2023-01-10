import { expect } from 'chai';
import * as supertest from 'supertest';
import * as express from "express";
import { Stubbed, testingContainer } from '../test-utils';
import { Application } from '../../app/app';
import { AuthenticationDatabaseService } from '../../app/services/database/authentication-db.service';
import { TYPES } from '../../app/const/types';
import { IHttpResponse } from '../../app/models/response';
import { Status } from '../../app/const/status';
import { IUser } from '../../app/models/user';
import bodyParser = require('body-parser');

describe('AuthenticationController', () => {
  let authenticationDatabaseService: Stubbed<AuthenticationDatabaseService>;
  let app: express.Application;

  beforeEach(async () => {
      const [container, sandbox] = await testingContainer();
      container.rebind(TYPES.AuthenticationDatabaseService).toConstantValue({
        createUser: sandbox.stub().resolves(),
        loginUser: sandbox.stub().resolves(),
        setUserConnection: sandbox.stub().resolves(),
      });

      authenticationDatabaseService = container.get(TYPES.AuthenticationDatabaseService);
      app = container.get<Application>(TYPES.Application).app;
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
  });

  describe('root', () => {

    it('responds with 200 and a string message', async () => {
      const expectedResponse = "Colorimage Authentication Database API";
      return supertest(app)
          .get('/api/loginAPI')
          .expect(200)
          .then((response: any) => {
              expect(response.body).equal(expectedResponse);
          });
    });
  });

  describe('createUser', () => {

    beforeEach(async () => {
      const [container, sandbox] = await testingContainer();
      container.rebind(TYPES.AuthenticationDatabaseService).toConstantValue({
        createUser: sandbox.stub().resolves(),
        loginUser: sandbox.stub().resolves(),
        setUserConnection: sandbox.stub().resolves(),
      });

      authenticationDatabaseService = container.get(TYPES.AuthenticationDatabaseService);
      app = container.get<Application>(TYPES.Application).app;
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
  });

    it('responds with 422 and error message if payload is invalid ', async () => {
      
      const payload = {
        username: "FirstName",
        password: "LastName",
        avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
        isConnected: 5
      }

      const expectedResponse: IHttpResponse = {
        status: Status.HTTP_UNPROCESSABLE_ENTITY,
        data: [
            {
                "location": "body",
                "param": "isConnected",
                "value": 5,
                "msg": "isConnected is either unspecified or specified incorrectly"
            }
        ]
      }
      
      return supertest(app)
          .post('/api/createUser')
          .send(payload)
          .expect(Status.HTTP_UNPROCESSABLE_ENTITY)
          .then((response: any) => {
              expect(response.body).to.deep.equal(expectedResponse);
          });
    });

    it('responds with 200 and success message if payload is valid ', async () => {
      
      const payload = {
        username: "FirstName",
        password: "LastName",
        avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
        isConnected: true
      }

      const expectedResponse: IHttpResponse = {
        status: Status.ACCOUNT_CREATED,
        data: "New account created",
      };
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
      //authenticationDatabaseService.createUser.resolves(expectedResponse);
      return supertest(app)
          .post('/api/createUser')
          .type("json") // This is the line you should set
          .send(payload)
          .expect(200)
          .then((response: any) => {
            console.log("AYO", response.body);
            console.log("expc", expectedResponse);
              expect(response.body).to.deep.equal(expectedResponse);
          });
          
    });
  });



});