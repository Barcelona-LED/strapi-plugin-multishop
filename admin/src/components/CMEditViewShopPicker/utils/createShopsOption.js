const createShopsOption = (shopsToDisplay, shopsFromData) => {
  return shopsToDisplay.map(({ name, id }) => {
    const matchingShopInData = shopsFromData.find(({ shop }) => shop === id);

    let status = 'did-not-create-shop';

    if (matchingShopInData) {
      status = matchingShopInData.published_at === null ? 'draft' : 'published';
    }

    return {
      id: matchingShopInData ? matchingShopInData.id : null,
      label: name,
      value: id,
      status,
    };
  });
};

export default createShopsOption;
