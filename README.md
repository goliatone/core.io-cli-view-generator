
Generate CRUD views from a (swagerish) model schema. If you are using Waterline, you can generate the schema using the [waterline-to-json-schema](https://github.com/goliatone/waterline-to-json-schema) module.


For each model create the following views:

- `update`: Update
- `create`: Create
- `index`: Instance
- `list`: Table
- `search`: Search

With two subviews:

- `_grid`
- `_form`

Attribute type mapping:
- `string`: Input
- `text`: TextArea
- `integer`: Input
- `float`: Input
- `date`: Input
- `time`: Input
- `datetime`: Input
- `boolean`: Check
- `binary`: Input
- `array`: Multi?
- `json`: TextArea

```js
//Actual Box
var Box = Waterline.Collection.extend({
    identity: 'box',
    //TODO: change identity name, make
    //as exportName, and remove exportName.
    exportName: 'Box',
    connection: connection,
    attributes: {
        name: {
            type:'string',
            // description: 'Box name'
        },
        uuid: {
            type: 'string',
            required: true,
            defaultsTo: function() {
                return uuid();
            }
        },
        eventName: 'string',
        eventResponse: 'string',
        eventAction: {
            type:'string',
            defaultsTo: 'ACTIVATE'
        },
        boxset: {
            model: 'boxset'
        },
        owner: {
            model: 'boxowner'
        },
        status: {
            type: 'string',
            //Should this be 3 states only?
            //available - assigned - broken? That way we do not
            //have to update on "route"
            enum: [ 'available', 'assigned', 'delivered', 'full', 'broken'],
            defaultsTo: 'available'
        }
    }
});
```

https://github.com/balderdashy/waterline-docs/blob/master/models/validations.md
```js
{
    attributes: {
      foo: {

          required: true,+

          empty: true,
          notEmpty: true,
          undefined: true,
          falsey: true,
          truthy: true,
          null: true,
          notNull: true,


          after: '12/12/2001',
          before: '12/12/2001',

          equals: 45,


          in: ['foo', 'bar'], // string contains one of this
          notIn: ['foo', 'bar'],// string NOT contains one of this

          contains: 'foobar',+
          notContains: 'foobar',+

          is: /ab+c/,+
          regex: /ab+c/,+
          not: /ab+c/,+
          notRegex: /ab+c/,+

          len: 35,+
          max: 24,+
          min: 4,+
          minLength: 4,+
          maxLength: 24,+

          lowercase: true,+
          uppercase: true,+

          string: true,+
          alpha: true,+
          numeric: true,+
          alphanumeric: true,+
          int: true,+
          integer: true,+
          number: true,+
          finite: true,+
          decimal: true,+
          float: true,+
          boolean: true,+

          array: true,+
          date: true,+
          hexColor: true,+
          hexadecimal: true,+
          email: true,+
          url: true,+
          urlish: true,+
          ip: true,+
          ipv4: true,+
          ipv6: true,+
          creditcard: true,+
          uuid: true,+
          uuidv3: true,+
          uuidv4: true,+
      }
    }
}
```

### Swagger
The generated schema can be used in the `definitions` part of a Swagger Manifest. If you use Swagger with your API you can extend the `definitions` with the generated JSON.

```js
{
  type: 'object',
  title: 'User',
  properties: {
    id: {
      type: 'integer',
      format: 'int32'
    },
    title: { type: 'string' },
    description: { type: 'string' },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time'
    }
  }
}
```

```js
{
  "swagger": "2.0",
  "info": {
    "title": "API",
    "version": "1.0.0"
  },
  "paths": {
    "user": {
      "get": {      
        "parameters": [ ],
        "responses": {
          "200": { "$ref": "#/definitions/user" }
        }
      }
    }
  },
  "definitions": {
    "user": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "format": 'int32'
        },
        "title": { "type": "string" },
        "description": { "type": "string" },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
}
```

<!--
$ref: JSON Pointer https://tools.ietf.org/html/rfc6901

Keywords:
http://json-schema.org/latest/json-schema-validation.html


https://www.npmjs.com/package/json-schema-request

ADD:
https://www.npmjs.com/package/express-url-breadcrumb

DOCS/API:
https://github.com/cloudflarearchive/json-schema-docs-generator/

https://github.com/milojs/milo-ui/tree/master/lib/forms
https://www.npmjs.com/package/assemble
-->
