import { expect } from 'chai';
import { JSONPath } from 'jsonpath-plus';
import spectralCore from '@stoplight/spectral-core';
const { Spectral, Document } = spectralCore;
import Parsers from '@stoplight/spectral-parsers';

// rules under test
import ruleset from '../rules/jsonapi-document-structure-top-level.js';

describe('jsonapi-document-structure-top-level ruleset:', function () {

  let spectral;

  beforeEach(function () {

    spectral = new Spectral();

  });

  describe('top-level-json-object:', function () {

    it('the json path expression should find the correct paths from the given document', function (done) {

      const doc = {
        'openapi': '3.0.2',
        'paths': {
          '/stuff': {
            'get': {
              'responses': {
                '200': {
                  'content': {
                    'application/vnd.api+json': {
                      'schema': {
                        'type': 'string'
                      }
                    }
                  }
                }
              }
            },
            'patch': {
              'requestBody': {
                'content': {
                  'application/vnd.api+json': {
                    'schema': {
                      'type': 'object'
                    }
                  }
                }
              }
            }
          },
          '/junk': {
            'patch': {
              'requestBody': {
                'content': {
                  'application/json': {
                    'schema': {
                      'type': 'string'
                    }
                  }
                }
              }
            }
          },
          '/things': {
            'patch': {
              'requestBody': {
                'content': {
                  'application/vnd.api+json': {
                    'schema': {
                      'type': 'string'
                    }
                  }
                }
              }
            }
          }
        }
      };
      const jsonPathExpression = ruleset.rules['top-level-json-object'].given;
      const expectedPaths = [
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema,
        doc.paths['/stuff'].patch.requestBody.content['application/vnd.api+json'].schema,
        doc.paths['/things'].patch.requestBody.content['application/vnd.api+json'].schema
      ];

      const results = JSONPath(jsonPathExpression, doc);

      expect(results.length).to.equal(3, 'Wrong number of results.');
      expect(results).to.deep.equal(expectedPaths, 'Wrong paths');
      done();

    });

    it('the rule should return "top-level-request-json-object" errors if using JSON:API and top level schema is NOT an object', function (done) {

      const badDocument = new Document(`
        openapi: 3.0.2
        paths:
          /stuff:
            get:
              responses:
                '200':
                  content:
                    application/vnd.api+json:
                      schema:
                        type: string
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: string
          /junk:
            patch:
              requestBody:
                content:
                  application/json:
                      schema:
                        type: string
          /things:
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
                  application/json:
                      schema:
                        type: string
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['top-level-json-properties'];
      delete spectral.ruleset.rules['top-level-json-properties-included'];
      delete spectral.ruleset.rules['top-level-json-properties-errors'];
      spectral.run(badDocument)
        .then((results) => {
          
          expect(results.length).to.equal(2, 'Error count should be 2');
          expect(results[0].code).to.equal('top-level-json-object', 'Incorrect error');
          expect(results[1].code).to.equal('top-level-json-object', 'Incorrect error');
          expect(results[0].path.join('/')).to.equal('paths//stuff/get/responses/200/content/application/vnd.api+json/schema/type', 'Wrong path');
          expect(results[1].path.join('/')).to.equal('paths//stuff/patch/requestBody/content/application/vnd.api+json/schema/type', 'Wrong path');
          done();

        })
        .catch((error) => {

          done(error);

        });

    });

    it('the rule should pass with NO errors', function (done) {

      const cleanDocument = new Document(`
        openapi: 3.0.2
        paths:
          /stuff:
            get:
              responses:
                '200':
                  content:
                    application/vnd.api+json:
                      schema:
                        type: object
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
          /junk:
            patch:
              requestBody:
                content:
                  application/json:
                      schema:
                        type: string
          /things:
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
                  application/json:
                      schema:
                        type: string
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['top-level-json-properties'];
      delete spectral.ruleset.rules['top-level-json-properties-included'];
      delete spectral.ruleset.rules['top-level-json-properties-errors'];
      spectral.run(cleanDocument)
        .then((results) => {
          
          expect(results.length).to.equal(0, 'Error(s) found');
          done();

        })
        .catch((error) => {

          done(error);

        });

    });

  });

  describe('top-level-json-properties:', function () {

    it('the json path expression should find the correct paths from the given document', function (done) {
      
      const doc = {
        'openapi': '3.0.2',
        'paths': {
          '/stuff': {
            'get': {
              'responses': {
                '200': {
                  'content': {
                    'application/vnd.api+json': {
                      'schema': {
                        'type': 'object',
                        'properties': {
                          'data': {
                            'type': 'object'
                          },
                          'links': {
                            'type': 'object'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            'patch': {
              'requestBody': {
                'content': {
                  'application/vnd.api+json': {
                    'schema': {
                      'type': 'object',
                      'properties': {
                        'data': {
                          'type': 'object'
                        },
                        'links': {
                          'type': 'object'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      const jsonPathExpression = ruleset.rules['top-level-json-properties'].given;
      const expectedPaths = [
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties,
        doc.paths['/stuff'].patch.requestBody.content['application/vnd.api+json'].schema.properties
      ];

      const results = JSONPath(jsonPathExpression, doc);

      expect(results.length).to.equal(2, 'Wrong number of results.');
      expect(results).to.deep.equal(expectedPaths, 'Wrong paths');
      done();
    
    });

    it('the rule should return "top-level-json-properties" errors if top level schema properties are not allowed', function (done) {

      const badDocument = new Document(`
        openapi: 3.0.2
        paths:
          /stuff:
            get:
              responses:
                '200':
                  content:
                    application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
                          links:
                            type: object
                          meta:
                            type: object
                          errors:
                            type: array
                          included:
                            type: array
                          jsonapi:
                            type: object
                          bar:
                            type: string
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
                          foo:
                            type: string
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['top-level-json-object'];
      delete spectral.ruleset.rules['top-level-json-properties-included'];
      delete spectral.ruleset.rules['top-level-json-properties-errors'];
      spectral.run(badDocument)
        .then((results) => {
          
          expect(results.length).to.equal(2, 'Error count should be 2');
          expect(results[0].code).to.equal('top-level-json-properties', 'Incorrect error');
          expect(results[1].code).to.equal('top-level-json-properties', 'Incorrect error');
          expect(results[0].path.join('/')).to.equal('paths//stuff/get/responses/200/content/application/vnd.api+json/schema/properties/bar', 'Wrong path');
          expect(results[1].path.join('/')).to.equal('paths//stuff/patch/requestBody/content/application/vnd.api+json/schema/properties/foo', 'Wrong path');
          done();

        })
        .catch((error) => {

          done(error);

        });

    });

    it('the rule should pass with NO errors', function (done) {

      const cleanDocument = new Document(`
        openapi: 3.0.2
        paths:
          /stuff:
            get:
              responses:
                '200':
                  content:
                    application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
                          links:
                            type: object
                          meta:
                            type: object
                          errors:
                            type: array
                          included:
                            type: array
                          jsonapi:
                            type: object
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['top-level-json-object'];
      delete spectral.ruleset.rules['top-level-json-properties-included'];
      delete spectral.ruleset.rules['top-level-json-properties-errors'];
      spectral.run(cleanDocument)
        .then((results) => {
          
          expect(results.length).to.equal(0, 'Error(s) found');
          done();

        })
        .catch((error) => {

          done(error);

        });

    });

  });

  describe('top-level-json-properties-included:', function () {

    it('the json path expression should find the correct paths from the given document', function (done) {

      const doc = {
        'openapi': '3.0.2',
        'paths': {
          '/stuff': {
            'get': {
              'responses': {
                '200': {
                  'content': {
                    'application/vnd.api+json': {
                      'schema': {
                        'type': 'object',
                        'properties': {
                          'data': {
                            'type': 'object'
                          },
                          'links': {
                            'type': 'object'
                          },
                          'included': {
                            'type': 'array'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            'patch': {
              'requestBody': {
                'content': {
                  'application/vnd.api+json': {
                    'schema': {
                      'type': 'object',
                      'properties': {
                        'data': {
                          'type': 'object'
                        },
                        'links': {
                          'type': 'object'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      const jsonPathExpression = ruleset.rules['top-level-json-properties-included'].given;
      const expectedPaths = [
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties
      ];

      const results = JSONPath(jsonPathExpression, doc);

      expect(results.length).to.equal(1, 'Wrong number of results.');
      expect(results).to.deep.equal(expectedPaths, 'Wrong paths');
      done();

    });

    it('the rule should return "top-level-json-properties-included" errors if included property exists w/o data property', function (done) {

      const badDocument = new Document(`
        openapi: 3.0.2
        paths:
          /stuff:
            get:
              responses:
                '200':
                  content:
                    application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          links:
                            type: object
                          meta:
                            type: object
                          errors:
                            type: array
                          included:
                            type: array
                          jsonapi:
                            type: object
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['top-level-json-object'];
      delete spectral.ruleset.rules['top-level-json-properties'];
      delete spectral.ruleset.rules['top-level-json-properties-errors'];
      spectral.run(badDocument)
        .then((results) => {
          
          expect(results.length).to.equal(1, 'Error count should be 1');
          expect(results[0].code).to.equal('top-level-json-properties-included', 'Incorrect error');
          expect(results[0].path.join('/')).to.equal('paths//stuff/get/responses/200/content/application/vnd.api+json/schema/properties', 'Wrong path');
          done();

        })
        .catch((error) => {

          done(error);

        });

    });

    it('the rule should pass with NO errors', function (done) {

      const cleanDocument = new Document(`
        openapi: 3.0.2
        paths:
          /stuff:
            get:
              responses:
                '200':
                  content:
                    application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
                          links:
                            type: object
                          meta:
                            type: object
                          errors:
                            type: array
                          included:
                            type: array
                          jsonapi:
                            type: object
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['top-level-json-object'];
      delete spectral.ruleset.rules['top-level-json-properties'];
      delete spectral.ruleset.rules['top-level-json-properties-errors'];
      spectral.run(cleanDocument)
        .then((results) => {
          
          expect(results.length).to.equal(0, 'Error(s) found');
          done();

        })
        .catch((error) => {

          done(error);

        });

    });

  });

  describe('top-level-json-properties-errors:', function () {

    it('the json path expression should find the correct paths from the given document', function (done) {

      const doc = {
        'openapi': '3.0.2',
        'paths': {
          '/stuff': {
            'get': {
              'responses': {
                '200': {
                  'content': {
                    'application/vnd.api+json': {
                      'schema': {
                        'type': 'object',
                        'properties': {
                          'data': {
                            'type': 'object'
                          },
                          'links': {
                            'type': 'object'
                          },
                          'errors': {
                            'type': 'array'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            'patch': {
              'requestBody': {
                'content': {
                  'application/vnd.api+json': {
                    'schema': {
                      'type': 'object',
                      'properties': {
                        'data': {
                          'type': 'object'
                        },
                        'links': {
                          'type': 'object'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      const jsonPathExpression = ruleset.rules['top-level-json-properties-errors'].given;
      const expectedPaths = [
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties
      ];

      const results = JSONPath(jsonPathExpression, doc);

      expect(results.length).to.equal(1, 'Wrong number of results.');
      expect(results).to.deep.equal(expectedPaths, 'Wrong paths');
      done();

    });

    it('the rule should return "top-level-json-properties-errors" errors if errors property exists w/ data property', function (done) {

      const badDocument = new Document(`
        openapi: 3.0.2
        paths:
          /stuff:
            get:
              responses:
                '200':
                  content:
                    application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
                          links:
                            type: object
                          meta:
                            type: object
                          errors:
                            type: array
                          included:
                            type: array
                          jsonapi:
                            type: object
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['top-level-json-object'];
      delete spectral.ruleset.rules['top-level-json-properties'];
      delete spectral.ruleset.rules['top-level-json-properties-included'];
      spectral.run(badDocument)
        .then((results) => {
          
          expect(results.length).to.equal(1, 'Error count should be 1');
          expect(results[0].code).to.equal('top-level-json-properties-errors', 'Incorrect error');
          expect(results[0].path.join('/')).to.equal('paths//stuff/get/responses/200/content/application/vnd.api+json/schema/properties/data', 'Wrong path');
          done();

        })
        .catch((error) => {

          done(error);

        });

    });

    it('the rule should pass with NO errors', function (done) {

      const cleanDocument = new Document(`
        openapi: 3.0.2
        paths:
          /stuff:
            get:
              responses:
                '200':
                  content:
                    application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          errors:
                            type: array
            patch:
              requestBody:
                content:
                  application/vnd.api+json:
                      schema:
                        type: object
                        properties:
                          data:
                            type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['top-level-json-object'];
      delete spectral.ruleset.rules['top-level-json-properties'];
      delete spectral.ruleset.rules['top-level-json-properties-included'];
      spectral.run(cleanDocument)
        .then((results) => {
          
          expect(results.length).to.equal(0, 'Error(s) found');
          done();

        })
        .catch((error) => {

          done(error);

        });

    });

  });

});
