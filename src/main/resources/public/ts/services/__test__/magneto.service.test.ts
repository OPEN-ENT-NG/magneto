import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {magnetoService} from "../magneto.service";

describe('TodolistService', () => {
    it('returns data when retrieve request is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {response: true};
        mock.onGet(`/magneto/test/ok`).reply(200, data);
        magnetoService.test().then(response => {
            expect(response.data).toEqual(data);
            done();
        });
    });

    it('returns data when retrieve request is correctly called other method', done => {
        let spy = jest.spyOn(axios, "get");
        magnetoService.test().then(response => {
            expect(spy).toHaveBeenCalledWith("/magneto/test/ok");
            done();
        });
    });
});
