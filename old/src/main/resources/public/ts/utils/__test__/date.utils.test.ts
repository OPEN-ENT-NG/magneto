import {DateUtils} from '../date.utils'
import {moment} from "entcore";
import {DATE_FORMAT} from "../../core/constants/date-format.const";

const date = '2019-04-16 18:15:00';

describe('format', () => {

    beforeAll(() => {
        moment.locale('fr');
    });

    test(`Using "${DATE_FORMAT.formattedDate}" it should returns "2019-04-16"`, () => {
        expect(DateUtils.format(date, DATE_FORMAT.formattedDate)).toEqual("2019-04-16");
    });
});