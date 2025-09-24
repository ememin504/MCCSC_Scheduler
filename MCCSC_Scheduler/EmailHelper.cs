using System;
using System.Net;
using System.Net.Mail;

public class EmailHelper
{
    public static string SendEmail(string toEmail, string subject, string body)
    {
        try
        {
            using (SmtpClient client = new SmtpClient("smtp-mail.outlook.com", 587))
            {
                client.Credentials = new NetworkCredential("MCCSC_Scheduler@outlook.com", "8SKAT-4VGGM-M6YUL-7ZXQ5-638WT");
                client.EnableSsl = true;

                MailMessage mail = new MailMessage("MCCSC_Scheduler@outlook.com", toEmail, subject, body);
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
