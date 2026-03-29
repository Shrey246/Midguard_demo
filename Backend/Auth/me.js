router.get("/me", authguard, async (req, res) => {
  const user = await User.findOne({
    where: { publicId: req.user.publicId },
    attributes: { exclude: ["password_hash"] },
  });

  res.json({ success: true, user });
});