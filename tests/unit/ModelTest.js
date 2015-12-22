require('./bootstrap');
require('./models/SampleModel');
require('./models/Article');
require('./models/User');
require('./models/Link');
require('./models/LinkData');

global.tests = Jii.namespace('tests');

/**
 * @class tests.unit.ModelTest
 * @extends Jii.base.UnitTest
 */
var self = Jii.defineClass('tests.unit.ModelTest', {

	__extends: 'Jii.base.UnitTest',

    _getModelInstances: function () {
        return [
            new tests.unit.models.SampleModel()
        ];
    },

    setterTest: function (test) {
        Jii._.each(this._getModelInstances(), function (sampleModel) {
            // Check insert scenario (set name and description)
            sampleModel.setScenario('insert');
            sampleModel.setAttributes({
                name: 'Ivan',
                description: 'Developer'
            });
            test.strictEqual(sampleModel.get('name'), 'Ivan');
            test.strictEqual(sampleModel.get('description'), 'Developer');

            // Check update scenario (can only set description)
            sampleModel.setScenario('update');
            sampleModel.setAttributes({
                name: 'John',
                description: 'Project manager'
            });
            test.strictEqual(sampleModel.get('name'), 'Ivan');
            test.strictEqual(sampleModel.get('description'), 'Project manager');

            // Check try set unknow attribute
            test.throws(function () {
                sampleModel.set('unknow', '...');
            }, Jii.exceptions.ApplicationException);
        });

        test.done();
    },

    validateTest: function (test) {
        Jii._.each(this._getModelInstances(), function (sampleModel) {
            sampleModel.setScenario('insert');
            sampleModel.set('description', '1234567890+1');
            sampleModel.validate().then(function (isValid) {

                // Check validation errors
                test.strictEqual(isValid, false);
                test.strictEqual(sampleModel.hasErrors(), true);
                test.strictEqual(Jii._.keys(sampleModel.getErrors()).length, 2);
                test.strictEqual(sampleModel.getErrors().name.length, 1); // Required error
                test.strictEqual(sampleModel.getErrors().description.length, 1); // Length error

                // Add custom error
                sampleModel.addError('uid', 'Error text..');
                sampleModel.addError('name', 'Error text..');
                test.strictEqual(Jii._.keys(sampleModel.getErrors()).length, 3);
                test.strictEqual(sampleModel.getErrors().name.length, 2);

                // Clear errors
                sampleModel.clearErrors();
                test.strictEqual(Jii._.keys(sampleModel.getErrors()).length, 0);
            });
        });

        test.done();
    },

    eventsTest: function(test) {
        var user = new tests.unit.models.User({
            id: 533,
            email: 'aaa@example.com',
            name: 'Aaa'
        });
        var counter;
        var counterFn = function() {
            counter++;
        };

        // No change
        counter = 0;
        user.on('change', counterFn);
        user.set('name', 'Aaa');
        test.strictEqual(counter, 0);

        // Change name field
        counter = 0;
        user.on('change:name', counterFn);
        user.set('name', 'Bbb');
        test.strictEqual(counter, 2);

        // Change through setAttribute
        counter = 0;
        user.setAttribute('name', 'Bbb2');
        test.strictEqual(counter, 2);

        // No change name field
        counter = 0;
        user.set('email', 'bbb@example.com');
        test.strictEqual(counter, 1);

        // Off event
        counter = 0;
        user.off('change:name', counterFn);
        user.set('name', 'Ccc');
        test.strictEqual(counter, 1);

        // Off all
        counter = 0;
        user.off('change', counterFn);
        user.set('name', 'Ddd');
        test.strictEqual(counter, 0);

        test.done();
    },

    eventsSubModelTest: function(test) {
        var article;
        var events = [];

        /**
         *
         * @param {Jii.model.ChangeEvent|Jii.model.LinkModelEvent} event
         */
        var eventsFn = function(event) {
            if (event instanceof Jii.model.ChangeEvent) {
                events.push.apply(events, Jii._.keys(event.changedAttributes));
            } else if (event instanceof Jii.model.LinkModelEvent) {
                events.push(event.relationName);
            }
        };

        // Sub-model, change, exists: change:user
        article = new tests.unit.models.Article({
            user: {
                id: 524,
                name: 'John'
            }
        });
        events = [];
        article.on('change:user', eventsFn);
        article.set('user.name', 'Bond');
        test.strictEqual(article.get('user').get('name'), 'Bond');
        test.deepEqual(events, ['name']);
        events = [];
        article.off('change:user', eventsFn);
        article.set('user.name', 'Qqww');
        test.deepEqual(events, []);

        // Sub-model, change, on not exists: change:user
        article = new tests.unit.models.Article();
        events = [];
        article.on('change:user link:user', eventsFn);
        article.set({
            user: {
                id: 524,
                name: 'John'
            }
        });
        test.strictEqual(article.get('user').get('name'), 'John');
        test.deepEqual(events, ['user']);
        article.set({
            user: {
                name: 'Piter'
            }
        });
        events = [];
        article.off('change:user', eventsFn);
        article.set('user.name', 'Qqww');
        test.deepEqual(events, []);

        // Sub-model, change:key, exists: change:user.name
        article = new tests.unit.models.Article({
            user: {
                id: 524,
                email: 'john@example.com'
            }
        });
        events = [];
        article.on('change:user.email', eventsFn);
        article.set('user.email', 'bond@gmail.com');
        test.strictEqual(article.get('user').get('email'), 'bond@gmail.com');
        test.deepEqual(events, ['email']);
        events = [];
        article.off('change:user.email', eventsFn);
        article.set('user.email', 'qweqe@mail.ru');
        test.deepEqual(events, []);

        // Sub-model, change:key, not exists: change:user.name
        article = new tests.unit.models.Article();
        events = [];
        article.on('link:user change:user.email', eventsFn);
        article.set({
            user: {
                id: 524,
                email: 'john@example.com'
            }
        });
        test.deepEqual(events, ['user']);
        article.set('user.email', 'piter@gmail.com');
        test.deepEqual(events, ['user', 'email']);
        events = [];
        article.off('change:user.email', eventsFn);
        article.set('user.email', 'qweqe@mail.ru');
        test.deepEqual(events, []);

        test.done();
    },

    eventsSubCollectionTest: function(test) {
        var article;
        var events = [];

        /**
         *
         * @param {Jii.model.CollectionEvent|Jii.model.LinkModelEvent|Jii.model.ChangeEvent} event
         */
        var eventsFn = function(event) {
            if (event instanceof Jii.model.ChangeEvent) {
                events.push.apply(events, Jii._.keys(event.changedAttributes));
            } else if (event instanceof Jii.model.LinkModelEvent) {
                events.push(event.relationName);
            } else if (event instanceof Jii.model.CollectionEvent) {
                Jii._.each(event.added, function(model) {
                    events.push('added-' + model.getPrimaryKey());
                });
                Jii._.each(event.removed, function(model) {
                    events.push('removed-' + model.getPrimaryKey());
                });
            }
        };

        // Sub-collection, change any, exists: change:links
        article = new tests.unit.models.Article();
        events = [];
        article.on('change:links', eventsFn);
        article.set('links', {id: 10, url: 'u1.com'});
        test.strictEqual(article.get('links').length, 1);
        test.deepEqual(events, ['added-10']);
        events = [];
        article.off('change:links', eventsFn);
        article.set('links', {id: 11, url: 'u2.com'});
        test.strictEqual(article.get('links').length, 2);
        test.deepEqual(events, []);

        // Sub-collection, change index, exists: change:links[0]
        article = new tests.unit.models.Article({
            links: [
                {id: 10, url: 'u1.com'},
                {id: 11, url: 'u2.com'}
            ]
        });
        events = [];
        article.on('change:links[0]', eventsFn);
        article.set('links', {id: 10, url: 'u1.net'});
        test.deepEqual(events, ['url']);
        article.set('links', {id: 11, url: 'u2.net'});
        test.deepEqual(events, ['url']);
        events = [];
        article.off('change:links', eventsFn);
        article.set('links', {id: 11, url: 'qwe'});
        test.deepEqual(events, []);

        // Sub-collection, change index, not exists: change:links[0]
        article = new tests.unit.models.Article();
        test.throws(function() {
            article.on('change:links[0]', eventsFn);
        }, Jii.exceptions.InvalidParamException);

        // Sub-collection, change:key any, exists: change:links.url
        article = new tests.unit.models.Article({
            links: [
                {id: 10, url: 'u1.com'},
                {id: 11, url: 'u2.com'}
            ]
        });
        events = [];
        article.on('change:links.url', eventsFn);
        article.set('links', {id: 10, url: 'u1.net'});
        test.deepEqual(events, ['url']);
        events = [];
        article.off('change:links.url', eventsFn);
        article.set('links', {id: 10, url: 'qweqwe.net'});
        test.deepEqual(events, []);

        // Sub-collection, change:key any, not exists: change:links.url
        article = new tests.unit.models.Article();
        events = [];
        article.on('change:links.url', eventsFn);
        article.set({
            links: [
                {id: 10, url: 'u1.com'},
                {id: 11, url: 'u2.com'}
            ]
        });
        article.set('links', {id: 10, url: 'u1.net'});
        test.deepEqual(events, ['url']);

        // Sub-collection, change:key any, not exists: change:links.url (off)
        events = [];
        article = new tests.unit.models.Article();
        article.on('change:links.url', eventsFn);
        article.off('change:links.url', eventsFn);
        article.set('links', {id: 10, url: 'qweqwe.net'});
        test.deepEqual(events, []);

        // Sub-collection, change:key index, exists: change:links[0].url
        article = new tests.unit.models.Article({
            links: [
                {id: 10, url: 'u1.com'},
                {id: 11, url: 'u2.com'}
            ]
        });
        events = [];
        article.on('change:links[1].url', eventsFn);
        article.set('links', {id: 11, url: 'uu.net'});
        test.deepEqual(events, ['url']);
        events = [];
        article.off('change:links.url', eventsFn);
        article.set('links', {id: 11, url: 'qweqwe.net'});
        test.deepEqual(events, []);

        // Sub-collection, change:key index, not exists: change:links[0].url
        article = new tests.unit.models.Article();
        test.throws(function() {
            article.on('change:links[0].url', eventsFn);
        }, Jii.exceptions.InvalidParamException);

        // Sub-collection, change:key.subKey any, exists: change:links.url.data
        article = new tests.unit.models.Article({
            links: [
                {id: 10, url: 'u1.com', dataId: 75, data: {id: 75, value: 'u1'}},
                {id: 11, url: 'u2.com', dataId: 79, data: {id: 79, value: 'u2'}}
            ]
        });
        events = [];
        article.on('change:links.data', eventsFn);
        article.set('links[0].data.value', 'upd 1');
        test.deepEqual(events, ['value']);
        events = [];
        article.off('change:links.data', eventsFn);
        article.set('links[0].data.value', 'upd qwe');
        test.deepEqual(events, []);

        // Sub-collection, change:key.subKey any, not exists: change:links.url.data
        article = new tests.unit.models.Article();
        events = [];
        article.on('change:links.data', eventsFn);
        article.set({
            links: [
                {id: 10, url: 'u1.com', dataId: 75, data: {id: 75, value: 'u1'}},
                {id: 11, url: 'u2.com', dataId: 79, data: {id: 79, value: 'u2'}}
            ]
        });
        article.set('links[0].data.value', 'upd 1');
        test.deepEqual(events, ['value']);


        // Sub-collection, change:key.subKey any, not exists: change:links.url.data (off)
        article = new tests.unit.models.Article();
        events = [];
        article.on('change:links.data', eventsFn);
        article.off('change:links.data', eventsFn);
        article.set({
            links: [
                {id: 10, url: 'u1.com', dataId: 75, data: {id: 75, value: 'u1'}},
                {id: 11, url: 'u2.com', dataId: 79, data: {id: 79, value: 'u2'}}
            ]
        });
        article.set('links[0].data.value', 'upd 1');
        test.deepEqual(events, []);

        test.done();
    }

});

module.exports = new self().exports();
