function norm(s) {
  return String(s || '').trim().toLowerCase();
}

function computeMatch(user, internship) {
  const userSkills = Array.isArray(user?.skills) ? user.skills : [];
  const reqSkills = Array.isArray(internship?.required_skills) ? internship.required_skills : [];

  const userSkillSet = new Set(userSkills.map(norm));

  const matched_skills = [];
  const missing_skills = [];

  for (const reqSkill of reqSkills) {
    if (userSkillSet.has(norm(reqSkill))) {
      matched_skills.push(reqSkill);
    } else {
      missing_skills.push(reqSkill);
    }
  }

  const skillPart =
    reqSkills.length > 0 ? Math.round((matched_skills.length / reqSkills.length) * 80) : 80;

  const eduMatches =
    internship?.education_target === 'Semua' ||
    internship?.education_target === user?.education_level;

  const eduPart = eduMatches ? 20 : 0;
  const score = skillPart + eduPart;
  const potential_score = eduMatches ? 100 : 80;

  let tier = 'low';
  if (score >= 75) {
    tier = 'high';
  } else if (score >= 50) {
    tier = 'mid';
  }

  return {
    score,
    tier,
    matched_skills,
    missing_skills,
    potential_score,
  };
}

module.exports = {
  computeMatch,
};
