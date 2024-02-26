module.exports = function (eleventyConfig) {
    eleventyConfig.addFilter("asUTCdate", function (date) {
        return date.toISOString().split('T')[0];
    });
};
