import { expect } from 'chai';
import { JSONPath } from 'jsonpath-plus';
import spectralCore from '@stoplight/spectral-core';
const { Spectral, Document } = spectralCore;
import Parsers from '@stoplight/spectral-parsers';

// rules under test
import ruleset from '../rules/jsonapi-document-structure-resource-identifier-object.js';

describe('jsonapi-document-structure-resource-identifier-object ruleset:', function () {

  let spectral;

  beforeEach(function () {

    spectral = new Spectral();

  });

  describe('relationships-data-object-explicit:', function () {

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
                            'type': 'object',
                            'properties': {
                              'relationships': {
                                'type': 'object',
                                'properties': {
                                  'myRelName': {
                                    'type': 'object',
                                    'properties': {
                                      'data': {
                                        'type': 'object',
                                        'properties': {
                                          'id': {
                                            'type': 'string'
                                          },
                                          'type': {
                                            'type': 'string'
                                          }  
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          'included': {
                            'type': 'array',
                            'items': {
                              'type': 'object',
                              'properties': {
                                'relationships': {
                                  'type': 'object',
                                  'properties': {
                                    'anotherRelName': {
                                      'type': 'object',
                                      'properties': {
                                        'data': {
                                          'type': 'object',
                                          'properties': {
                                            'id': {
                                              'type': 'string'
                                            },
                                            'type': {
                                              'type': 'string'
                                            },
                                            'meta': {
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
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '/junk': {
            'get': {
              'responses': {
                '200': {
                  'content': {
                    'application/vnd.api+json': {
                      'schema': {
                        'type': 'object',
                        'properties': {
                          'data': {
                            'type': 'object',
                            'properties': {
                              'relationships': {
                                'type': 'object',
                                'properties': {
                                  'myRelName': {
                                    'type': 'object',
                                    'properties': {
                                      'data': {
                                        'type': 'array',
                                        'items': {
                                          'type': 'object',
                                          'properties': {
                                            'id': {
                                              'type': 'string'
                                            },
                                            'type': {
                                              'type': 'string'
                                            }  
                                          }
                                        }                                       
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
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
      const jsonPathExpression = ruleset.rules['relationships-data-object-explicit'].given;
      const expectedPaths = [
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties.data.properties.relationships.properties.myRelName.properties.data,
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties.included.items.properties.relationships.properties.anotherRelName.properties.data,
        doc.paths['/junk'].get.responses[200].content['application/vnd.api+json'].schema.properties.data.properties.relationships.properties.myRelName.properties.data   
      ];

      const results = JSONPath(jsonPathExpression, doc);

      expect(results.length).to.equal(3, 'Wrong number of results.');
      expect(results).to.deep.equal(expectedPaths, 'Wrong paths');
      done();

    });

    it('the rule should return "relationships-data-object-explicit" errors if relationships..data members do not meet min resource identifier object schema', function (done) {

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
                          relationships:
                            type: object
                            properties:
                              myRelName:
                                type: object
                                properties:
                                  data: 
                                    type: object
                                    required: ["id", "type"]
                                    properties:
                                      id:
                                        type: string
                          included:
                            type: array
                            items:
                              type: object
                              properties:
                                relationships:
                                  type: object
                                  properties:
                                    data: 
                                      type: object
                                      required: ["id", "type"]
                                      properties:
                                        type:
                                          type: string
          /junk:
            get:
              responses:
                '200':
                content:
                  application/vnd.api+json:
                    schema:
                      type: object
                      properties:
                        relationships:
                          type: object
                          properties:
                            myRelName:
                              type: object
                              properties:
                                data: 
                                  type: object
                                  properties:
                                    id:
                                      type: string
                                    type:
                                      type: string
                        included:
                          type: array
                          items:
                            type: object
                            properties:
                              relationships:
                                type: object
                                properties:
                                  data: 
                                    type: array
                                    items:
                                      type: object
                                      required: ["id", "type"]
                                      properties:
                                        id:
                                          type: string
                                        meta:
                                          type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['relationships-data-object-composed'];
      delete spectral.ruleset.rules['relationships-data-allowed-fields'];
      spectral.run(badDocument)
        .then((results) => {
          
          // using error start line numbers to keep from using looooong path statements.
          // expect errors on lines 18,21,32,35,53,68,73 (7 in total)

          expect(results.length).to.equal(7, 'Error count should be 7');
          expect(results[0].code).to.equal('relationships-data-object-explicit', 'Incorrect error');
          expect(results[1].code).to.equal('relationships-data-object-explicit', 'Incorrect error');
          expect(results[2].code).to.equal('relationships-data-object-explicit', 'Incorrect error');
          expect(results[3].code).to.equal('relationships-data-object-explicit', 'Incorrect error');
          expect(results[4].code).to.equal('relationships-data-object-explicit', 'Incorrect error');
          expect(results[5].code).to.equal('relationships-data-object-explicit', 'Incorrect error');
          expect(results[6].code).to.equal('relationships-data-object-explicit', 'Incorrect error');

          expect(results[0].range.start.line).to.equal(18, 'Wrong path');
          expect(results[1].range.start.line).to.equal(21, 'Wrong path');
          expect(results[2].range.start.line).to.equal(32, 'Wrong path');
          expect(results[3].range.start.line).to.equal(35, 'Wrong path');
          expect(results[4].range.start.line).to.equal(53, 'Wrong path');
          expect(results[5].range.start.line).to.equal(68, 'Wrong path');
          expect(results[6].range.start.line).to.equal(73, 'Wrong path');
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
                    relationships:
                      type: object
                      properties:
                        myRelName:
                          type: object
                          properties:
                            data: 
                              type: object
                              required: ["id", "type"]
                              properties:
                                id:
                                  type: string
                                type:
                                  type: string    
                    included:
                      type: array
                      items:
                        type: object
                        properties:
                          relationships:
                            type: object
                            properties:
                              data: 
                                type: array
                                items:
                                  type: object
                                  required: ["id", "type"]
                                  properties:
                                    id:
                                      type: string
                                    type:
                                      type: string
                                    meta:
                                      type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['relationships-data-object-composed'];
      delete spectral.ruleset.rules['relationships-data-allowed-fields'];
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

  describe('relationships-data-object-composed:', function () {

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
                            'type': 'object',
                            'properties': {
                              'relationships': {
                                'type': 'object',
                                'properties': {
                                  'myRelName': {
                                    'type': 'object',
                                    'properties': {
                                      'data': {
                                        'allOf': [
                                          {
                                            'type': 'object',
                                            'required': [
                                              'id',
                                              'type'
                                            ],
                                            'properties': {
                                              'id': {
                                                'type': 'string',
                                                'pattern': '^([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[afA-F0-9]{4}-[a-fA-F0-9]{12}){1}$',
                                                'example': '2357c52f-6c78-4747-8106-e185c08143aa'
                                              },
                                              'type': {
                                                'type': 'string'
                                              }
                                            }
                                          },
                                          {
                                            'type': 'object',
                                            'properties': {
                                              'type': {
                                                'enum': [
                                                  'manufacturers'
                                                ]
                                              }
                                            }
                                          }
                                        ]
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          'included': {
                            'type': 'array',
                            'items': {
                              'type': 'object',
                              'properties': {
                                'relationships': {
                                  'type': 'object',
                                  'properties': {
                                    'anotherRelName': {
                                      'type': 'object',
                                      'properties': {
                                        'data': {
                                          'allOf': [
                                            {
                                              'type': 'object',
                                              'required': [
                                                'id',
                                                'type'
                                              ],
                                              'properties': {
                                                'id': {
                                                  'type': 'string',
                                                  'pattern': '^([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[afA-F0-9]{4}-[a-fA-F0-9]{12}){1}$',
                                                  'example': '2357c52f-6c78-4747-8106-e185c08143aa'
                                                },
                                                'type': {
                                                  'type': 'string'
                                                }
                                              }
                                            },
                                            {
                                              'type': 'object',
                                              'properties': {
                                                'type': {
                                                  'enum': [
                                                    'manufacturers'
                                                  ]
                                                }
                                              }
                                            }
                                          ]
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '/junk': {
            'get': {
              'responses': {
                '200': {
                  'content': {
                    'application/vnd.api+json': {
                      'schema': {
                        'type': 'object',
                        'properties': {
                          'data': {
                            'type': 'object',
                            'properties': {
                              'relationships': {
                                'type': 'object',
                                'properties': {
                                  'myRelName': {
                                    'type': 'object',
                                    'properties': {
                                      'data': {
                                        'allOf': [
                                          {
                                            'type': 'object',
                                            'required': [
                                              'id',
                                              'type'
                                            ],
                                            'properties': {
                                              'id': {
                                                'type': 'string',
                                                'pattern': '^([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[afA-F0-9]{4}-[a-fA-F0-9]{12}){1}$',
                                                'example': '2357c52f-6c78-4747-8106-e185c08143aa'
                                              },
                                              'type': {
                                                'type': 'string'
                                              }
                                            }
                                          },
                                          {
                                            'type': 'object',
                                            'properties': {
                                              'type': {
                                                'enum': [
                                                  'manufacturers'
                                                ]
                                              }
                                            }
                                          }
                                        ]                                  
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
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
      const jsonPathExpression = ruleset.rules['relationships-data-object-composed'].given;
      const expectedPaths = [
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties.data.properties.relationships.properties.myRelName.properties.data.allOf,
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties.included.items.properties.relationships.properties.anotherRelName.properties.data.allOf,
        doc.paths['/junk'].get.responses[200].content['application/vnd.api+json'].schema.properties.data.properties.relationships.properties.myRelName.properties.data.allOf   
      ];

      const results = JSONPath(jsonPathExpression, doc);

      expect(results.length).to.equal(3, 'Wrong number of results.');
      expect(results).to.deep.equal(expectedPaths, 'Wrong paths');
      done();
      
    });

    it('the rule should return "relationships-data-object-composed" errors if relationships..data members do not meet min resource identifier object schema', function (done) {

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
                          relationships:
                            type: object
                            properties:
                              myRelName:
                                type: object
                                properties:
                                  data: 
                                    allOf:
                                      - type: object
                                        required: ["id", "type"]
                                        properties:
                                          id:
                                            type: string
                          included:
                            type: array
                            items:
                              type: object
                              properties:
                                relationships:
                                  type: object
                                  properties:
                                    data:
                                      allOf:
                                        - type: object
                                          required: ["id", "type"]
                                          properties:
                                            type:
                                              type: string
          /junk:
            get:
              responses:
                '200':
                content:
                  application/vnd.api+json:
                    schema:
                      type: object
                      properties:
                        relationships:
                          type: object
                          properties:
                            myRelName:
                              type: object
                              properties:
                                data:
                                  allOf:
                                    - type: object
                                      properties:
                                        id:
                                          type: string
                                        type:
                                          type: string
                        included:
                          type: array
                          items:
                            type: object
                            properties:
                              relationships:
                                type: object
                                properties:
                                  data: 
                                    type: array
                                    items:
                                      allOf:
                                        - type: object
                                          required: ["id", "type"]
                                          properties:
                                            id:
                                              type: string
                                            meta:
                                              type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['relationships-data-object-explicit'];
      delete spectral.ruleset.rules['relationships-data-allowed-fields'];
      spectral.run(badDocument)
        .then((results) => {
          
          // using error start line numbers to keep from using looooong path statements.
          // expect errors on lines 19,34,56,74 (4 in total)

          expect(results.length).to.equal(4, 'Error count should be 4');
          expect(results[0].code).to.equal('relationships-data-object-composed', 'Incorrect error');
          expect(results[1].code).to.equal('relationships-data-object-composed', 'Incorrect error');
          expect(results[2].code).to.equal('relationships-data-object-composed', 'Incorrect error');
          expect(results[3].code).to.equal('relationships-data-object-composed', 'Incorrect error');

          expect(results[0].range.start.line).to.equal(19, 'Wrong path');
          expect(results[1].range.start.line).to.equal(34, 'Wrong path');
          expect(results[2].range.start.line).to.equal(56, 'Wrong path');
          expect(results[3].range.start.line).to.equal(74, 'Wrong path');
          
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
                    relationships:
                      type: object
                      properties:
                        myRelName:
                          type: object
                          properties:
                            data: 
                              type: object
                              required: ["id", "type"]
                              properties:
                                id:
                                  type: string
                                type:
                                  type: string    
                    included:
                      type: array
                      items:
                        type: object
                        properties:
                          relationships:
                            type: object
                            properties:
                              data:
                                allOf:
                                  - type: object
                                    required: ["id", "type"]
                                    properties:
                                      id:
                                        type: string
                                      type:
                                        type: string
                                      meta:
                                        type: object
                                  - type: object
                                    properties:
                                      type:
                                        enum: ["manufacturers"]
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['relationships-data-object-explicit'];
      delete spectral.ruleset.rules['relationships-data-allowed-fields'];
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

  describe('relationships-data-allowed-fields:', function () {

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
                            'type': 'object',
                            'properties': {
                              'relationships': {
                                'type': 'object',
                                'properties': {
                                  'myRelName': {
                                    'type': 'object',
                                    'properties': {
                                      'data': {
                                        'type': 'object',
                                        'properties': {
                                          'id': {
                                            'type': 'string'
                                          },
                                          'type': {
                                            'type': 'string'
                                          }  
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          'included': {
                            'type': 'array',
                            'items': {
                              'type': 'object',
                              'properties': {
                                'relationships': {
                                  'type': 'object',
                                  'properties': {
                                    'anotherRelName': {
                                      'type': 'object',
                                      'properties': {
                                        'data': {
                                          'type': 'object',
                                          'properties': {
                                            'id': {
                                              'type': 'string'
                                            },
                                            'type': {
                                              'type': 'string'
                                            },
                                            'meta': {
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
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '/junk': {
            'get': {
              'responses': {
                '200': {
                  'content': {
                    'application/vnd.api+json': {
                      'schema': {
                        'type': 'object',
                        'properties': {
                          'data': {
                            'type': 'object',
                            'properties': {
                              'relationships': {
                                'type': 'object',
                                'properties': {
                                  'myRelName': {
                                    'type': 'object',
                                    'properties': {
                                      'data': {
                                        'type': 'array',
                                        'items': {
                                          'type': 'object',
                                          'required': ['id', 'type'],
                                          'properties': {
                                            'id': {
                                              'type': 'string'
                                            },
                                            'type': {
                                              'type': 'string'
                                            }  
                                          }
                                        }                                       
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
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
      const jsonPathExpression = ruleset.rules['relationships-data-allowed-fields'].given;
      const expectedPaths = [
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties.data.properties.relationships.properties.myRelName.properties.data.properties,
        doc.paths['/stuff'].get.responses[200].content['application/vnd.api+json'].schema.properties.included.items.properties.relationships.properties.anotherRelName.properties.data.properties,
        doc.paths['/junk'].get.responses[200].content['application/vnd.api+json'].schema.properties.data.properties.relationships.properties.myRelName.properties.data.items.properties   
      ];

      const results = JSONPath(jsonPathExpression, doc);

      expect(results.length).to.equal(3, 'Wrong number of results.');
      expect(results).to.deep.equal(expectedPaths, 'Wrong paths');
      done();

    });

    it('the rule should return "relationships-data-allowed-fields" errors if object contains fields other than id, type, or meta ', function (done) {
      
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
                          relationships:
                            type: object
                            properties:
                              myRelName:
                                type: object
                                properties:
                                  data: 
                                    type: object
                                    required: ["id", "type"]
                                    properties:
                                      id:
                                        type: string
                                      type:
                                        type: string
                                      badProp:
                                        type: string
                          included:
                            type: array
                            items:
                              type: object
                              properties:
                                relationships:
                                  type: object
                                  properties:
                                    data: 
                                      type: object
                                      required: ["id", "type"]
                                      properties:
                                        id:
                                          type: string
                                        type:
                                          type: string
                                        meta2:
                                          type: object
          /junk:
            get:
              responses:
                '200':
                content:
                  application/vnd.api+json:
                    schema:
                      type: object
                      properties:
                        relationships:
                          type: object
                          properties:
                            myRelName:
                              type: object
                              properties:
                                data: 
                                  type: object
                                  properties:
                                    id:
                                      type: string
                                    type:
                                      type: string
                        included:
                          type: array
                          items:
                            type: object
                            properties:
                              relationships:
                                type: object
                                properties:
                                  data: 
                                    type: array
                                    items:
                                      type: object
                                      required: ["id", "type"]
                                      properties:
                                        id:
                                          type: string
                                        type:
                                          type: string
                                        meta:
                                          type: object
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['relationships-data-object-explicit'];
      delete spectral.ruleset.rules['relationships-data-object-composed'];
      spectral.run(badDocument)
        .then((results) => {
          
          // using error start line numbers to keep from using looooong path statements.
          // expect errors on lines 26, 44 (2 in total)

          expect(results.length).to.equal(2, 'Error count should be 2');
          expect(results[0].code).to.equal('relationships-data-allowed-fields', 'Incorrect error');
          expect(results[1].code).to.equal('relationships-data-allowed-fields', 'Incorrect error');

          expect(results[0].range.start.line).to.equal(26, 'Wrong path');
          expect(results[1].range.start.line).to.equal(44, 'Wrong path');
          
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
                        relationships:
                          type: object
                          properties:
                            myRelName:
                              type: object
                              properties:
                                data: 
                                  type: object
                                  required: ["id", "type"]
                                  properties:
                                    id:
                                      type: string
                                    type:
                                      type: string
                                    meta:
                                      type: object
                        included:
                          type: array
                          items:
                            type: object
                            properties:
                              relationships:
                                type: object
                                properties:
                                  data: 
                                    type: object
                                    required: ["id", "type"]
                                    properties:
                                      id:
                                        type: string
                                      type:
                                        type: string
                                        enum: ["manufacturers"]
      `, Parsers.Yaml);

      spectral.setRuleset(ruleset);
      delete spectral.ruleset.rules['relationships-data-object-explicit'];
      delete spectral.ruleset.rules['relationships-data-object-composed'];
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
