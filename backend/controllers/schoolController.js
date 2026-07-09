const School = require('../models/School');
const User = require('../models/User');
const { sendEmail } = require('../services/notificationService');

const getSchools = async (req, res) => {
  try {
    const schools = await School.find()
      .populate('principalId')
      .exec();
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
      .populate('principalId');
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSchool = async (req, res) => {
  const school = new School(req.body);
  try {
    const newSchool = await school.save();
    res.status(201).json(newSchool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    Object.assign(school, req.body);
    const updatedSchool = await school.save();
    res.json(updatedSchool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSchoolStatistics = async (req, res) => {
  try {
    const schoolId = req.params.id;
    const school = await School.findById(schoolId);
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const stats = {
      schoolName: school.name,
      totalStudents: school.totalStudents,
      totalTeachers: school.totalTeachers,
      totalClasses: school.totalClasses,
      academicYear: school.academicYear,
      status: school.status,
      subscriptionPlan: school.subscriptionPlan,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generatePassword = () => {
  return `Edu@${Math.floor(1000 + Math.random() * 9000)}`;
};

const createOrUpdateAdminUser = async ({ schoolEmail, principalName, phone, normalizedPlan, schoolCode }) => {
  const existingUser = await User.findOne({ email: schoolEmail });
  const nameParts = String(principalName || '').trim().split(' ');
  const firstName = nameParts[0] || 'Admin';
  const lastName = nameParts.slice(1).join(' ') || 'User';

  if (existingUser) {
    existingUser.role = existingUser.role || 'super_admin';
    existingUser.firstName = firstName || existingUser.firstName;
    existingUser.lastName = lastName || existingUser.lastName;
    existingUser.phone = phone || existingUser.phone;
    existingUser.subscriptionPlan = normalizedPlan;
    await existingUser.save();

    return {
      user: existingUser,
      credentials: {
        userId: existingUser.userId,
        password: null,
      },
    };
  }

  let userId = `${schoolCode}-admin`;
  let suffix = 0;
  while (await User.findOne({ userId })) {
    suffix += 1;
    userId = `${schoolCode}-admin${suffix}`;
    if (suffix > 20) break;
  }

  const password = generatePassword();
  const user = new User({
    userId,
    password,
    role: 'super_admin',
    firstName,
    lastName,
    email: schoolEmail,
    phone,
    subscriptionPlan: normalizedPlan,
  });

  await user.save();

  return {
    user,
    credentials: {
      userId,
      password,
    },
  };
};

const upgradePlan = async (req, res) => {
  try {
    const {
      schoolName,
      schoolEmail,
      phone,
      address,
      principalName,
      subscriptionPlan,
      subscriptionDurationMonths,
      paymentMethod,
      paymentReference,
    } = req.body;

    if (!schoolName || !schoolEmail || !phone || !subscriptionPlan) {
      return res.status(400).json({ message: 'School name, email, phone, and plan are required.' });
    }

    const normalizedPlan = String(subscriptionPlan).toLowerCase();
    const durationMonths = Number(subscriptionDurationMonths) || 12;

    if (!['silver', 'gold', 'platinum'].includes(normalizedPlan)) {
      return res.status(400).json({ message: 'Invalid subscription plan.' });
    }

    const schoolCode = `${schoolName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    let school = await School.findOne({ $or: [{ email: schoolEmail }, { name: schoolName }] });

    if (!school) {
      school = new School({
        name: schoolName,
        code: schoolCode,
        email: schoolEmail,
        phone,
        address: {
          street: address || '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India',
        },
        principalName,
        academicYear: new Date().getFullYear().toString(),
        subscriptionPlan: normalizedPlan,
        subscriptionDurationMonths: durationMonths,
        subscriptionStatus: 'active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        paymentReference: paymentReference || `PAY-${Date.now()}`,
        status: 'active',
      });
    } else {
      school.subscriptionPlan = normalizedPlan;
      school.subscriptionDurationMonths = durationMonths;
      school.subscriptionStatus = 'active';
      school.subscriptionStartDate = startDate;
      school.subscriptionEndDate = endDate;
      school.paymentReference = paymentReference || school.paymentReference || `PAY-${Date.now()}`;
      school.phone = phone || school.phone;
      school.email = schoolEmail || school.email;
      school.address = school.address || {};
      school.address.street = address || school.address.street || '';
      school.address.city = school.address.city || '';
      school.address.state = school.address.state || '';
      school.address.country = school.address.country || 'India';
      school.principalName = principalName || school.principalName;
    }

    await school.save();

    const { user, credentials } = await createOrUpdateAdminUser({
      schoolEmail,
      principalName,
      phone,
      normalizedPlan,
      schoolCode,
    });

    const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : 'http://localhost:3000/login';
    let emailSent = false;

    const emailSubject = `${normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1)} Plan Activated - School Operating System Access`;
    const emailMessage = `
      <h2>Welcome to the ${normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1)} Plan</h2>
      <p>Your school <strong>${school.name}</strong> has been successfully upgraded to the <strong>${normalizedPlan.toUpperCase()}</strong> plan.</p>
      <p>You can log in using the credentials below:</p>
      <ul>
        <li><strong>User ID:</strong> ${credentials.userId}</li>
        <li><strong>Password:</strong> ${credentials.password || 'Your existing password'}</li>
      </ul>
      <p>Login here: <a href="${loginUrl}">${loginUrl}</a></p>
      <p>If you did not request this upgrade, please contact support.</p>
    `;

    try {
      await sendEmail(schoolEmail, emailSubject, emailMessage);
      emailSent = true;
    } catch (emailError) {
      console.error('Failed to send gold plan activation email:', emailError);
    }

    res.json({
      message: `${school.name} has been upgraded to the ${normalizedPlan.toUpperCase()} plan successfully.`,
      school: {
        id: school._id,
        name: school.name,
        email: school.email,
        subscriptionPlan: school.subscriptionPlan,
        subscriptionDurationMonths: school.subscriptionDurationMonths,
        subscriptionStatus: school.subscriptionStatus,
        paymentReference: school.paymentReference,
        paymentMethod,
      },
      credentials,
      emailSent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchools,
  getSchoolById,
  addSchool,
  updateSchool,
  deleteSchool,
  getSchoolStatistics,
  upgradePlan,
};
