const createShopsOption = (shopsToDisplay, shopsFromData) => {
  return shopsToDisplay.map(({ name, code }) => {
    const matchingShopInData = shopsFromData.find(({ shop }) => shop === code);

    let status = 'did-not-create-shop';

    if (matchingShopInData) {
      status = matchingShopInData.published_at === null ? 'draft' : 'published';
    }

    return {
      id: matchingShopInData ? matchingShopInData.id : null,
      label: name,
      value: code,
      status,
    };
  });
};

export default createShopsOption;
