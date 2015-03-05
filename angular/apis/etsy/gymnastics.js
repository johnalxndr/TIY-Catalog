var expect = require('chai').expect;
var assert = require('chai').assert;
var _ = require('lodash');
var url = require('url');
var data = require('./trending/trending.json');

var categories = {
        art: 'art',
        clothing: 'clothing',
        vintage: 'vintage',
        wedding: 'wedding',
        jewelry: 'jewelry'
    }
    /*
        this for loop checks each item and if that item has variations, it
        spits back the url callback to get the variations
    */
for (var i = 0; i < data.results.length; i++) {
    if (data.results[i].has_variations == true) {
        console.log('https://openapi.etsy.com/v2/listings/' + data.results[i].listing_id + '?api_key=q4ubii6kukovuc0hl2e8myxx&includes=Variations')
    }
};

var API = {
    'protocol': 'https',
    'host': 'openapi.etsy.com',
    'base': 'v2',
    'path': 'listings/active.json',
    // Only use with JSONP...
    // 'pathname': '/v2/listings/trending.js'
    'query': {
        // Only use with JSONP...
        // 'callback': 'JSON_CALLBACK',
        /**
         * @param Number limit number of entries to return
         * @param Number offset number of entries to skip
         */
        'limit': 50,
        'offset': 0,
        /* If you want a sub category add an '/' and name of sub_category as a string after name of `top tier` category
            - ex: category=categories.art/'printmaking'
            - ex: category=categories.clothing/'men'
          SEE ABOVE `categoires` OBJECT FOR DIFFERENT CATEGORIES */
        'category': categories.art,
        'api_key': 'q4ubii6kukovuc0hl2e8myxx',
        'fields': 'title,price,has_variations,listing_id,num_favorers',
        'includes': 'MainImage'
    },
};

function urlForAPI() {

    return url.format(_.extend({}, API, {
        'pathname': API.base + '/' + API.path
    }));
}
console.log(urlForAPI);
/**
 * @param Object data from the Etsy API (raw)
 * @returns Object
 */
function transform(data) {
    return _.map(data.results, function (object) {
        return {
            title: object.title,
            description: object.description,
            price: object.price,
            images: {
                full: object.MainImage.url_fullxfull,
                small: object.MainImage.url_170x135
            }
        }
    })
}

it.skip('should produce the correct URL', function () {
    expect(urlForAPI()).to.equal(
        'https://openapi.etsy.com/v2/listings/some-category.json' +
        '?limit=50&offset=0&api_key=q4ubii6kukovuc0hl2e8myxx' +
        '&fields=title%2Cdescription%2Cprice%2Ccurrency_code' +
        '&includes=MainImage'
    );
});


describe('transform', function () {
    describe('given `trending.json` from the API', function () {
        var trending;

        beforeEach(function () {
            // Feed the raw Etsy data to `transform` to get nicer data...
            trending = transform(require('./trending/trending.json'));
        });

        it('should have 50 results', function () {
            assert.equal(trending.length, 50,
                'Because we asked for `limit=50`, right?'
            );
        });
        describe('the fields I expect to have for each listing', function () {
            it('should have a `title` field', function () {
                expect(_.pluck(trending, 'title').length).to.equal(trending.length);
            });

            it('should have a `description` field', function () {
                expect(_.pluck(trending, 'description').length).to.equal(trending.length);
            });

            it.skip('should NOT have a `foo` field', function () {
                expect(_.pluck(trending, 'foo').length).to.equal(0);
            });

            it('should have a `MainImage` field', function () {
                expect(trending[0].images).to.be.a('object');
                expect(trending[0].images.full).to.be.a('string');
                expect(trending[0].images.small).to.be.a('string');
            })
        });
    }); // END describe `trending.json`

    describe('given `some-category.json` from the API', function () {
        var products;

        beforeEach(function () {
            products = transform(require('./art/art.json'));
        });

        describe('everything that `trending.json` has, right?', function () {
          it('should have 50 results', function(){
            expect(products).to.be.length(50)
          })
          it('should have a `has_variations` field for each item so we can check variations',function(){
            expect(_.pluck(products, 'has_variations')).to.be.length(50)
          })
    }); // END describe `some-category.json`
});

describe('given a specified `subCategory`, describe the results', function(){
  it('should show that we forgot to include listing_id', function(){
    var weddingClothingSub = require('./wedding/weddingSubCategories/category=wedding-clothing.json');
    expect(weddingClothingSub[0]).to.equal(undefined)
  })
})
});
