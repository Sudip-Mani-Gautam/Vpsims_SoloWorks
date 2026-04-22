using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using vpsims.DTOs;
using vpsims.Interfaces;

namespace vpsims.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BranchController : ControllerBase
    {
        private readonly IBranchService _branchService;

        public BranchController(IBranchService branchService)
        {
            _branchService = branchService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var branches = await _branchService.GetAllAsync();
            return Ok(branches);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var branch = await _branchService.GetByIdAsync(id);
            if (branch == null) return NotFound();
            return Ok(branch);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateBranchDto dto)
        {
            var branch = await _branchService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = branch.Id }, branch);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, CreateBranchDto dto)
        {
            var branch = await _branchService.UpdateAsync(id, dto);
            if (branch == null) return NotFound();
            return Ok(branch);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _branchService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
