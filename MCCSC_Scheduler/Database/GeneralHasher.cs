using System.Security.Cryptography;
using System.Text;

public static class GeneralHasher
{
    private static string ToHex(byte[] bytes)
    {
        StringBuilder sb = new StringBuilder(bytes.Length * 2);
        foreach (byte b in bytes)
        {
            sb.AppendFormat("{0:x2}", b);
        }
        return sb.ToString();
    }
    public static string ComputeSHA256(string input)
    {
        using (var sha = SHA256.Create())
        {
            byte[] bytes = Encoding.UTF8.GetBytes(input);
            byte[] hash = sha.ComputeHash(bytes);
            return ToHex(hash);
        }
    }

    public static string ComputeSHA512(string input)
    {
        using (var sha = SHA512.Create()) // This now clearly refers to the class
        {
            byte[] bytes = Encoding.UTF8.GetBytes(input);
            byte[] hash = sha.ComputeHash(bytes);
            return ToHex(hash);
        }
    }
    public static string ComputeSHA511(string input)
    {
        using (var sha = SHA512.Create()) // This now clearly refers to the class
        {
            byte[] bytes = Encoding.UTF8.GetBytes(input);
            byte[] hash = sha.ComputeHash(bytes);
            return ToHex(hash);
        }
    }


    public static string HMAC256(string input, string key)
    {
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
        {
            byte[] data = Encoding.UTF8.GetBytes(input);
            byte[] hash = hmac.ComputeHash(data);
            return ToHex(hash);
        }
    }
}
