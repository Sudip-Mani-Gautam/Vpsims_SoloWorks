using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace vpsims.Controllers
{
    /// <summary>
    /// Generic file upload endpoint for payment proofs (images/PDFs) and QR codes.
    /// Files are saved to wwwroot/uploads/{folder}/ and served as static assets.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadController> _logger;

        private static readonly string[] AllowedMimeTypes =
        {
            "image/jpeg", "image/jpg", "image/png", "image/webp",
            "image/gif", "application/pdf"
        };

        private static readonly long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

        public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
        {
            _env = env;
            _logger = logger;
        }

        /// <summary>
        /// Upload a payment proof (image or PDF). Accessible by Customer, Staff, Admin.
        /// POST /api/upload/payment-proof
        /// </summary>
        [HttpPost("payment-proof")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadPaymentProof(IFormFile file)
        {
            return await SaveFile(file, "payment-proofs");
        }

        /// <summary>
        /// Upload a support ticket attachment.
        /// POST /api/upload/support-attachment
        /// </summary>
        [HttpPost("support-attachment")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadSupportAttachment(IFormFile file)
        {
            return await SaveFile(file, "support-attachments");
        }

        /// <summary>
        /// Upload a QR code image. Admin only.
        /// POST /api/upload/qr-code
        /// </summary>
        [HttpPost("qr-code")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadQrCode(IFormFile file)
        {
            return await SaveFile(file, "qr-codes");
        }

        private async Task<IActionResult> SaveFile(IFormFile? file, string subFolder)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            if (file.Length > MaxFileSizeBytes)
                return BadRequest(new { message = "File size exceeds the 10MB limit." });

            if (!AllowedMimeTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "Invalid file type. Allowed: JPG, PNG, WEBP, GIF, PDF." });

            try
            {
                var folder = Path.Combine(_env.WebRootPath, "uploads", subFolder);
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                var ext = Path.GetExtension(file.FileName).ToLower();
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(folder, fileName);

                await using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var url = $"/uploads/{subFolder}/{fileName}";
                return Ok(new { url, fileName, contentType = file.ContentType, sizeBytes = file.Length });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "File upload failed.");
                return StatusCode(500, new { message = "Upload failed. Please try again." });
            }
        }
    }
}
