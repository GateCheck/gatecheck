const removeConfidentialData = (doc, onlyPassword) => {
    const json = doc.toJSON();
    delete json.password;
    if (!onlyPassword) {
        delete json.id_number;
        delete json.administrative_level;
    }
    return json;
}

module.exports = {
    removeConfidentialData
}
