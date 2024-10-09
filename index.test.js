const { makeHasher, REGION } = require('./index')

const TEST_CONFIG ={
    salt: { source: "string", value: "TEST_HASH"},
    hash: { strategy: "sha256" }
};

function hasherWithConfig(cfg) {
    return () => { return makeHasher(cfg); }
}

function getTestHasher(cfg=TEST_CONFIG) {
    return hasherWithConfig(cfg)();
}



test('creation with non-supported algorithms should fail', () => {
    expect(hasherWithConfig({})).toThrow();
    expect(hasherWithConfig({ hash: { strategy: "sha512" } })).toThrow();
});


test('creation with good config should succeed', () => {
    expect(hasherWithConfig(TEST_CONFIG)).not.toThrow()
});

test('hashing data should result in a hash and a source', () => {
    const h = getTestHasher()

    expect(h.generateHashForExtractedObject({
        static: ["a", "b", "c"],
    })).toEqual({
        hashed_id: "JFO25BNLV6JPLHKXROXCXJLZQG63K7XTUVFVZ56YCUKAHRZYSTIQ====",
        hashed_id_src: "abc",
    })

});