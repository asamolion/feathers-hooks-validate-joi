/* eslint comma-dangle: 0, object-shorthand: 0, prefer-arrow-callback: 0*/ /* ES5 code */

const errors = require('@feathersjs/errors');
const utils = require('feathers-hooks-common/lib/services');
const joiErrorsForForms = require('joi-errors-for-forms');

function validator(joiSchema, joiOptions = {}, translator, ifTest) {
  return function validatorInner(context) {
    utils.checkContext(
      context,
      'before',
      ['create', 'update', 'patch'],
      'validate-joi'
    );

    const values = utils.getItems(context);
    // console.log('values: ', values);
    const validatedValues = joiSchema.validate(values, joiOptions);
    // console.log('validatedValues: ', validatedValues);
    const formErrors = translator(validatedValues.error);

    if (formErrors) {
      // Hacky, but how else without a custom assert?
      const msg = ifTest ? JSON.stringify(formErrors) : 'Invalid data';
      throw new errors.BadRequest(msg, { errors: formErrors });
    }

    if (joiOptions.convert) {
      utils.replaceItems(context, validatedValues);
    }

    return context;
  };
}

module.exports = {
  form: function(joiSchema, joiOptions, translations, ifTest) {
    const translator = joiErrorsForForms.form(translations);
    return validator(joiSchema, joiOptions, translator, ifTest);
  },
  mongoose: function(joiSchema, joiOptions, translations, ifTest) {
    const translator = joiErrorsForForms.mongoose(translations);
    return validator(joiSchema, joiOptions, translator, ifTest);
  },
};
