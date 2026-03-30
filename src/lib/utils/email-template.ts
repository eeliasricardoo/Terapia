export const getStyledEmailTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4a7c7c 0%, #3b82f6 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .content { padding: 40px 30px; background: #ffffff; }
    .footer { padding: 20px; text-align: center; background: #f8fafc; font-size: 12px; color: #94a3b8; }
    .button { display: inline-block; padding: 12px 24px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sentirz</h1>
    </div>
    <div class="content">
      <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Sentirz. Todos os direitos reservados.<br>
      Sua jornada de autocuidado começa aqui.
    </div>
  </div>
</body>
</html>
`
