const buildAbsoluteUrl = (req, resourcePath) => {
  if (!resourcePath) {
    return null;
  }

  if (/^https?:\/\//i.test(resourcePath)) {
    return resourcePath;
  }

  const base = `${req.protocol}://${req.get('host')}`;
  return resourcePath.startsWith('/') ? `${base}${resourcePath}` : `${base}/${resourcePath}`;
};

const mapUserRowToResponse = (req, row) => {
  if (!row) {
    return null;
  }

  const response = {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    age: row.age,
    weight: row.weight,
    height: row.height,
    gender: row.gender,
    goal: row.goal,
    dietaryPreference: row.dietary_preference,
    allergies: row.allergies,
    bodyType: row.body_type,
    calorieTarget: row.calorie_target,
    photoUrl: buildAbsoluteUrl(req, row.photo_url),
  };

  if (row.is_admin !== undefined) {
    response.isAdmin = Boolean(row.is_admin);
  }

  return response;
};

module.exports = { buildAbsoluteUrl, mapUserRowToResponse };
