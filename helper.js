module.exports.deleteFromArray = function (array, key, value) {
  return array.filter((object) => {
    console.log({ value: value, id: object.id });
    return object[key] !== value;
  });
};
