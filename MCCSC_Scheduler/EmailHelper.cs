using System;
using System.Net;
using System.Net.Mail;

public class EmailHelper
{
    public static string SendEmail(string toEmail, string subject, string body)
    {
        try
        {
            using (SmtpClient client = new SmtpClient("smtp.yourmailserver.com", 587))
            {
                client.Credentials = new NetworkCredential("your-email@example.com", "your-password");
                client.EnableSsl = true; // Needed for Gmail, Outlook, etc.

                MailMessage mail = new MailMessage("your-email@example.com", toEmail, subject, body);
                client.Send(mail);
            }

            return "Email sent successfully!";
        }
        catch (Exception ex)
        {
            return $"Email failed: {ex.Message}";
        }
    }
}
