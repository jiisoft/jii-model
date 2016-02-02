require('./bootstrap');
require('./models/Article');
require('./models/User');

global.tests = Jii.namespace('tests');

/**
 * @class tests.unit.CollectionTest
 * @extends Jii.base.UnitTest
 */
var self = Jii.defineClass('tests.unit.CollectionTest', {

	__extends: 'Jii.base.UnitTest',

    arrayInstanceOfTest: function (test) {
        var collection = new Jii.base.Collection([], {modelClass: false});
        collection.push(222);
        collection.push(3636);

        test.strictEqual(collection[1], 3636);
        test.strictEqual(collection.length, 2);
        test.strictEqual(collection.className(), 'Jii.base.Collection');
        test.strictEqual(collection instanceof Jii.base.Collection, true);

        test.done();
    },

    arrayMethodsTest: function(test) {
        var coll, result;

        coll = this._coll().concat(4,5);
        test.deepEqual(coll.getModels(), [1,2,3,4,5]);
        test.deepEqual(coll.length, 5);

        coll = this._coll();
        coll.reverse();
        test.deepEqual(coll.getModels(), [3,2,1]);
        test.deepEqual(coll.length, 3);

        coll = this._coll(['a', 'tw', 5, 'zz', 1]);
        coll.sort();
        test.deepEqual(coll.getModels(), [1, 5, 'a', 'tw', 'zz']);
        test.deepEqual(coll.length, 5);

        coll = this._coll();
        result = coll.splice(1, 1);
        test.deepEqual(coll.getModels(), [1, 3]);
        test.deepEqual(coll.length, 2);
        test.deepEqual(result, [2]);

        coll = this._coll();
        result = coll.splice(2, 0, 8, 9, 26);
        test.deepEqual(coll.getModels(), [1, 2, 8, 9, 26, 3]);
        test.deepEqual(coll.length, 6);
        test.deepEqual(result, []);

        coll = this._coll();
        result = coll.slice(1, 3);
        test.deepEqual(result.getModels(), [2, 3]);
        test.deepEqual(coll.length, 3);
        test.deepEqual(result.length, 2);

        coll = this._coll();
        coll.push(7, 5, 8, 53);
        test.deepEqual(coll.getModels(), [1, 2, 3, 7, 5, 8, 53]);
        test.deepEqual(coll.length, 7);

        coll = this._coll();
        result = coll.pop();
        test.deepEqual(coll.getModels(), [1, 2]);
        test.deepEqual(coll.length, 2);
        test.deepEqual(result, 3);

        coll = this._coll();
        result = coll.unshift(5, 6, 73, 22);
        test.deepEqual(coll.getModels(), [5, 6, 73, 22, 1, 2, 3]);
        test.deepEqual(coll.length, 7);
        test.deepEqual(result, 7);

        coll = this._coll();
        result = coll.shift();
        test.deepEqual(coll.getModels(), [2, 3]);
        test.deepEqual(coll.length, 2);
        test.deepEqual(result, 1);

        test.done();
    },

    underscoreMethodsTest: function(test) {
        var coll, result;

        result = 0;
        this._coll().each(function() {
            result++;
        });
        this._coll().forEach(function() {
            result++;
        });
        test.deepEqual(result, 6);

        result = this._coll().map(function(v) {
            return v * 2;
        });
        test.deepEqual(result, [2, 4, 6]);

        result = this._coll().reduce(function(memo, num){
            return memo + num;
        }, 0);
        test.deepEqual(result, 6);

        result = this._coll([[0, 1], [2, 3], [4, 5]]).reduceRight(function(a, b){
            return a.concat(b);
        }, []);
        test.deepEqual(result, [4, 5, 2, 3, 0, 1]);

        result = this._coll([1, 2, 3, 4, 5, 6]).find(function(num){
            return num % 2 == 0;
        });
        test.deepEqual(result, 2);

        result = this._coll([1, 2, 3, 4, 5, 6]).filter(function(num){
            return num % 2 == 0;
        });
        test.deepEqual(result, [2, 4, 6]);

        result = this._coll([{a: 1}, {a: 2}]).where({a: 2});
        test.deepEqual(result, [{a: 2}]);

        result = this._coll([{a: 1}, {a: 2}]).findWhere({a: 2});
        test.deepEqual(result, {a: 2});

        result = this._coll([1, 2, 3, 4, 5, 6]).reject(function(num){
            return num % 2 == 0;
        });
        test.deepEqual(result, [1, 3, 5]);

        result = this._coll([true, 1, null, 'yes']).every(Jii._.identity);
        test.deepEqual(result, false);

        result = this._coll([null, 0, 'yes', false]).some();
        test.deepEqual(result, true);

        result = this._coll().contains(3);
        test.deepEqual(result, true);

        result = this._coll().includes(3);
        test.deepEqual(result, true);

        result = this._coll([[5, 1, 7], [3, 2, 1]]).invoke('sort');
        test.deepEqual(result, [[1, 5, 7], [1, 2, 3]]);

        result = this._coll([{name: 'moe', age: 40}, {name: 'larry', age: 50}]).pluck('name');
        test.deepEqual(result, ["moe", "larry"]);

        result = this._coll([{name: 'moe', age: 40}, {name: 'larry', age: 50}]).max(function(s){ return s.age; });
        test.deepEqual(result, {name: 'larry', age: 50});

        result = this._coll([{name: 'moe', age: 40}, {name: 'larry', age: 50}]).min(function(s){ return s.age; });
        test.deepEqual(result, {name: 'moe', age: 40});

        coll = this._coll([1, 2, 3, 4, 5, 6]);
        coll.sortBy(function(num){ return Math.sin(num); });
        test.deepEqual(coll.getModels(), [5, 4, 6, 3, 1, 2]);

        result = this._coll([1.3, 2.1, 2.4]).groupBy(function(num){ return Math.floor(num); });
        test.deepEqual(result, {1: [1.3], 2: [2.1, 2.4]});

        result = this._coll([{name: 'moe', age: 40}, {name: 'larry', age: 50}]).indexBy(function(s){ return s.age; });
        test.deepEqual(result, {"40": {name: 'moe', age: 40}, "50": {name: 'larry', age: 50}});

        result = this._coll([1, 2, 3, 4, 5]).countBy(function(num){ return num % 2 == 0 ? 'even': 'odd'; });
        test.deepEqual(result, {odd: 3, even: 2});

        test.deepEqual(this._coll().size(), 3);

        test.deepEqual(this._coll([5, 4, 3, 2, 1]).first(), 5);

        test.deepEqual(this._coll([5, 4, 3, 2, 1]).last(), 1);

        test.deepEqual(this._coll([5, 4, 3, 2, 1]).initial(), [5, 4, 3, 2]);

        test.deepEqual(this._coll([5, 4, 3, 2, 1]).rest(), [4, 3, 2, 1]);

        test.deepEqual(this._coll([1, 2, 1, 0, 3, 1, 4]).without(0, 1), [2, 3, 4]);

        test.deepEqual(this._coll([1, 2, 3]).indexOf(2), 1);

        test.deepEqual(this._coll([1, 2, 3, 1, 2, 3]).lastIndexOf(2), 4);

        test.deepEqual(this._coll([{name: 'moe', age: 40}, {name: 'curly', age: 60}]).sortedIndex({name: 'larry', age: 50}, 'age'), 1);

        test.deepEqual(this._coll([4, 6, 8, 12]).findIndex(function(v) { return v % 6 === 0; }), 1);

        test.deepEqual(this._coll([4, 6, 8, 12]).findLastIndex(function(v) { return v % 6 === 0; }), 3);

        coll = this._coll([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
        coll.shuffle();
        test.notDeepEqual(coll, [1, 2, 3]);

        test.strictEqual(this._coll([]).isEmpty(), true);

        test.done();
    },

    addRemoveTest: function(test) {
        var user1 = new tests.unit.models.User({
            id: 519,
            name: 'John'
        });
        var user2 = new tests.unit.models.User({
            id: 844,
            name: 'Fred'
        });

        var coll = new Jii.base.Collection();

        coll.add(user1);
        test.strictEqual(coll.at(0).get('name'), 'John');
        test.strictEqual(coll.length, 1);
        test.strictEqual(coll.getCount(), 1);
        test.strictEqual(coll.size(), 1);

        coll.add(user2);
        test.strictEqual(coll.at(1).get('name'), 'Fred');
        test.strictEqual(coll.at(-1).get('name'), 'Fred');
        test.strictEqual(coll.getById(844).get('name'), 'Fred');
        test.strictEqual(coll.getById(519).get('name'), 'John');
        test.strictEqual(coll.length, 2);
        test.strictEqual(coll.getCount(), 2);
        test.strictEqual(coll.size(), 2);

        coll.remove(user1);
        test.strictEqual(coll.at(0).get('name'), 'Fred');
        test.strictEqual(coll.getById(844).get('name'), 'Fred');
        test.strictEqual(coll.getById(519), null);
        test.strictEqual(coll.at(1), null);
        test.strictEqual(coll.length, 1);
        test.strictEqual(coll.getCount(), 1);
        test.strictEqual(coll.size(), 1);

        coll.reset();
        test.strictEqual(coll.getById(519), null);
        test.strictEqual(coll.at(0), null);
        test.strictEqual(coll.length, 0);
        test.strictEqual(coll.getCount(), 0);
        test.strictEqual(coll.size(), 0);

        test.done();
    },

    changeAndMovingTest: function(test) {
        var coll;

        coll = this._coll([1, 2, 3, 4, 5]);
        coll._change(3, [7, 8, 2, 9], [], true);
        test.deepEqual(coll.getModels(), [1, 2, 3, 7, 8, 9, 4, 5]);

        coll = this._coll([1, 2, 3, 4, 5]);
        coll._change(2, [7, 8, 4, 9], [], true);
        test.deepEqual(coll.getModels(), [1, 2, 7, 8, 9, 3, 4, 5]);

        coll = this._coll([1, 2, 3, 4, 5]);
        coll._change(2, [9], [1, 2], true);
        test.deepEqual(coll.getModels(), [9, 3, 4, 5]);

        test.done();
    },

    setTest: function(test) {
        var coll;

        // Add - always add
        coll = new Jii.base.Collection([], {modelClass: 'tests.unit.models.User'});
        coll.add({ id: 519, name: 'John' });
        test.strictEqual(coll.length, 1);
        coll.add({ id: 519, name: 'Fred' });
        test.strictEqual(coll.length, 2);
        test.strictEqual(coll.at(0).get('name'), 'John');
        test.strictEqual(coll.at(1).get('name'), 'Fred');
        coll.add({ id: 222, name: 'Qqwe' });
        test.strictEqual(coll.at(0).get('name'), 'John');
        test.strictEqual(coll.at(1).get('name'), 'Fred');
        test.strictEqual(coll.at(2).get('name'), 'Qqwe');
        test.strictEqual(coll.length, 3);

        // Set - all by one id
        coll.set({ id: 519, name: 'Ivan' });
        test.strictEqual(coll.at(0).get('name'), 'Ivan');
        test.strictEqual(coll.at(1).get('name'), 'Ivan');

        // Remove - all by one id
        coll.remove({ id: 519 });
        test.strictEqual(coll.length, 1);

        // Set - overwrite attributes
        coll = new Jii.base.Collection([], {modelClass: tests.unit.models.User});
        coll.set({ id: 519, name: 'John' });
        test.strictEqual(coll.length, 1);
        test.strictEqual(coll.at(0).get('name'), 'John');
        coll.set({ id: 519, name: 'Fred' });
        test.strictEqual(coll.length, 1);
        test.strictEqual(coll.at(0).get('name'), 'Fred');

        // Set model key by index
        coll = new Jii.base.Collection([{id: 288, name: 'Ivan'}], {modelClass: tests.unit.models.User});
        coll.set('[0].name', 'Bond');
        test.strictEqual(coll.at(0).get('name'), 'Bond');
        test.strictEqual(coll.get('[0]name'), 'Bond');
        test.throws(function() {
            coll.set('[1].name', 'Bond');
        }, Jii.exceptions.InvalidParamException);

        test.done();
    },

    eventsAddRemoveTest: function(test) {
        var coll;
        var events = [];

        /**
         *
         * @param {Jii.model.CollectionEvent} event
         */
        var eventsFn = function(event) {
            Jii._.each(event.added, function(model) {
                events.push('added-' + model.getPrimaryKey());
            });
            Jii._.each(event.removed, function(model) {
                events.push('removed-' + model.getPrimaryKey());
            });
        };

        coll = new Jii.base.Collection([], {modelClass: 'tests.unit.models.User'});

        // Sub-collection, add
        events = [];
        coll.on('add', eventsFn);
        coll.add({id: 288, name: 'Ivan'});
        test.deepEqual(events, ['added-288']);

        // Sub-collection, add after off
        events = [];
        coll.off('add', eventsFn);
        coll.add({id: 311, name: 'Bond'});
        test.deepEqual(events, []);

        // Sub-collection, remove
        events = [];
        coll.on('remove', eventsFn);
        coll.remove([{id: 311, name: 'Bond'}]);
        test.deepEqual(events, ['removed-311']);

        // Sub-collection, remove after off
        events = [];
        coll.off('remove', eventsFn);
        coll.remove(288);
        test.deepEqual(events, []);

        // Sub-collection, change
        events = [];
        coll.on('change', eventsFn);
        coll.add({id: 288, name: 'Ivan'});
        coll.add({id: 301, name: 'John'});
        coll.remove(288);
        test.deepEqual(events, ['added-288', 'added-301', 'removed-288']);

        // Sub-collection, change after off
        events = [];
        coll.off('change', eventsFn);
        coll.add({id: 408, name: 'Qqq'});
        coll.remove(301);
        test.deepEqual(events, []);

        test.done();
    },

    eventsChangeTest: function(test) {
        var coll;
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

        // change
        coll = new Jii.base.Collection([], {modelClass: 'tests.unit.models.User'});
        events = [];
        coll.on('change', eventsFn);
        coll.add({id: 288, name: 'Ivan'});
        coll.add({id: 289, name: 'Ivan'});
        coll.remove(289);
        test.deepEqual(events, ['added-288', 'added-289', 'removed-289']);

        // change:key
        coll = new Jii.base.Collection([], {modelClass: 'tests.unit.models.User'});
        events = [];
        coll.on('change:name', eventsFn);
        coll.add({id: 288, name: 'Ivan'});
        coll.at(0).set('name', 'John');
        test.deepEqual(events, ['name']);

        // change:foo.bar
        coll = new Jii.base.Collection([], {modelClass: 'tests.unit.models.Article'});
        events = [];
        coll.on('change:user.name', eventsFn);
        coll.add({id: 55, user: {id: 10, name: 'Bond'}});
        coll.at(0).set('user.name', 'John');
        test.deepEqual(events, ['name']);

        test.done();
    },

    resetTest: function(test) {
        var coll;
        var events = [];

        /**
         *
         * @param {Jii.model.CollectionEvent|Jii.model.LinkModelEvent|Jii.model.ChangeEvent} event
         */
        var eventsFn = function(event) {
            Jii._.each(event.added, function(model) {
                events.push('added-' + model.getPrimaryKey());
            });
            Jii._.each(event.removed, function(model) {
                events.push('removed-' + model.getPrimaryKey());
            });
        };

        coll = new Jii.base.Collection([], {modelClass: 'tests.unit.models.User'});
        coll.add({id: 250, name: 'Ivan'});
        coll.add({id: 300, name: 'Piter'});
        coll.on('change', eventsFn);

        events = [];
        coll.reset(coll.getModels());
        test.strictEqual(coll.length, 2);
        test.deepEqual(events, []);

        events = [];
        coll.reset(coll.at(0));
        test.strictEqual(coll.length, 1);
        test.deepEqual(events, ['removed-300']);

        events = [];
        coll.reset([
            {id: 300, name: 'Ivan'},
            {id: 480, name: 'Qqq'},
            {id: 490, name: 'Www'}
        ]);
        test.strictEqual(coll.length, 3);
        test.deepEqual(events, ['added-300', 'added-480', 'added-490', 'removed-250']);

        test.done();
    },


    cloneTest: function (test) {
        var root = new Jii.base.Collection([], {modelClass: 'tests.unit.models.Article'});
        root.add({id: 55, title: 'Test article'});

        var child = root.createChildCollection();
        test.strictEqual(child.length, 1);
        test.strictEqual(child.at(0).get('id'), 55);

        // Add to root
        root.add({id: 66, title: 'Second article'});
        test.strictEqual(child.length, 2);
        test.strictEqual(child.at(0).get('id'), 55);
        test.strictEqual(child.at(1).get('id'), 66);

        // Remove from root
        root.remove(55);
        test.strictEqual(child.length, 1);
        test.strictEqual(child.at(0).get('id'), 66);

        // Add to child
        child.add({id: 77, title: 'Third article'});
        test.strictEqual(root.length, 2);
        test.strictEqual(root.at(1).get('id'), 77);

        // Remove from child
        child.remove(66);
        test.strictEqual(root.length, 1);
        test.strictEqual(root.at(0).get('id'), 77);

        test.done();
    },

    filterTest: function(test) {
        var root = new Jii.base.Collection([], {modelClass: 'tests.unit.models.Article'});
        root.add({id: 55, title: 'aaa bbb'});
        root.add({id: 66, title: 'bbb ccc'});
        root.add({id: 77, title: 'ccc'});
        test.strictEqual(root.length, 3);

        var child = root.createChildCollection();
        test.strictEqual(child.length, 3);

        child.setFilter(function(model) {
            return model.get('title').indexOf('bbb') !== -1;
        });
        test.strictEqual(root.length, 3);
        test.strictEqual(child.length, 2);

        root.add({id: 88, title: 'ddd'});
        test.strictEqual(root.length, 4);
        test.strictEqual(child.length, 2);

        root.add({id: 99, title: 'zzz bbb'});
        test.strictEqual(root.length, 5);
        test.strictEqual(child.length, 3);

        child.remove(99);
        test.strictEqual(root.length, 4);
        test.strictEqual(child.length, 2);

        test.done();
    },

    subFilterTest: function(test) {
        var root = new Jii.base.Collection([], {modelClass: 'tests.unit.models.Article'});
        root.add({id: 55, title: 'aaa bbb'});
        root.add({id: 66, title: 'bbb ccc'});
        root.add({id: 77, title: 'ccc ddd'});
        test.strictEqual(root.length, 3);

        var child1 = root.createChildCollection();
        child1.setFilter(function(model) {
            return model.get('title').indexOf('bbb') !== -1;
        });

        var child2 = child1.createChildCollection();
        child2.setFilter(function(model) {
            return model.get('title').indexOf('ccc') !== -1;
        });

        test.strictEqual(root.length, 3);
        test.strictEqual(child1.length, 2);
        test.strictEqual(child2.length, 1);

        child1.add({id: 88, title: 'ccc'});
        test.strictEqual(root.length, 4);
        test.strictEqual(child1.length, 2);
        test.strictEqual(child2.length, 1);

        child1.setFilter(null);
        test.strictEqual(root.length, 4);
        test.strictEqual(child1.length, 4);
        test.strictEqual(child2.length, 3);

        child1.get(66).set('title', 'zzz');
        child1.refreshFilter();
        test.strictEqual(root.length, 4);
        test.strictEqual(child1.length, 4);
        test.strictEqual(child2.length, 2);

        test.done();
    },

    proxyTest: function(test) {
        var coll = new Jii.base.Collection([], {modelClass: 'tests.unit.models.Article'});
        coll.add({id: 55, title: 'aaa bbb'});

        var modelAdapter = {
            instance: function(original) {
                return {};
            },
            setValues: function(original, proxy, values) {
                Jii._.extend(proxy, values)
            }
        };

        var cloned = coll.cloneProxy({
            instance: function(original) {
                return [];
            },
            add: function(original, cloned, models) {
                cloned.push.apply(cloned, Jii._.map(models, function(model) {
                    return model.cloneProxy(modelAdapter);
                }));
            },
            remove: function(original, cloned, models) {
                Jii._.each(models, function(model) {
                    Jii._.each(cloned, function(obj, index) {
                        if (model.getPrimaryKey() === obj.id) {
                            cloned.splice(index, 1);
                        }
                    });
                });
            }
        });
        test.deepEqual(cloned.length, 1);
        test.deepEqual(cloned[0], coll.at(0).getAttributes());

        coll.at(0).set('title', 'ccc ddd');
        test.strictEqual(cloned[0].title, 'ccc ddd');

        coll.remove(coll.at(0));
        test.deepEqual(cloned.length, 0);

        coll.add({id: 55, title: 'zzz'});
        test.deepEqual(cloned.length, 1);
        test.strictEqual(cloned[0].title, 'zzz');

        test.done();
    },

    /**
     *
     * @param arr
     * @returns {Jii.base.Collection}
     * @private
     */
    _coll: function(arr) {
        arr = arr || [1, 2, 3];
        return new Jii.base.Collection(arr, {
            modelClass: false
        });
    }

});

module.exports = new self().exports();
