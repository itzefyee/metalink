import bpy
import math
import os
from mathutils import Vector


def resolve_path(relative_path: str) -> str:
    """Return an absolute path relative to this script file."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(base_dir, relative_path))


# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import STL file
stl_path = resolve_path('temp_model.stl')
if not os.path.exists(stl_path):
    raise FileNotFoundError(f'STL file not found: {stl_path}')

bpy.ops.wm.stl_import(filepath=stl_path)

# Get the imported object
obj = bpy.context.selected_objects[0]
bpy.context.view_layer.objects.active = obj

# Center the object
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
obj.location = (0, 0, 0)

# Scale to reasonable size (leave margin so frame never crops)
max_dimension = max(obj.dimensions)
scale_factor = 1.6 / max_dimension
obj.scale = (scale_factor, scale_factor, scale_factor)

# Set up material (lighter metallic, high reflections)
mat = bpy.data.materials.new(name='MetalMaterial')
mat.use_nodes = True
bsdf = mat.node_tree.nodes['Principled BSDF']
bsdf.inputs['Metallic'].default_value = 1.0
bsdf.inputs['Roughness'].default_value = 0.04
bsdf.inputs['Base Color'].default_value = (0.86, 0.87, 0.9, 1.0)

if obj.data.materials:
    obj.data.materials[0] = mat
else:
    obj.data.materials.append(mat)

# Create pivot so rotation stays centered
pivot = bpy.data.objects.new('RotationPivot', None)
pivot.location = Vector((0.0, 0.0, 0.0))
bpy.context.scene.collection.objects.link(pivot)
obj.parent = pivot
obj.matrix_parent_inverse = pivot.matrix_world.inverted()

# Set up camera (sideways hero angle, generous framing)
cam_data = bpy.data.cameras.new('Camera')
cam = bpy.data.objects.new('Camera', cam_data)
bpy.context.scene.collection.objects.link(cam)
bpy.context.scene.camera = cam
cam.location = Vector((2.7, -1.2, 1.35))
cam.data.lens = 55
cam.data.clip_end = 200


def look_at(obj, target: Vector):
    direction = target - obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    obj.rotation_euler = rot_quat.to_euler()


look_at(cam, Vector((0.0, 0.0, 0.0)))

# Lighting setup (soft area lights + world glow)
def add_area_light(name, energy, size, size_y, location, rotation):
    light_data = bpy.data.lights.new(name=name, type='AREA')
    light_data.energy = energy
    light_data.shape = 'RECTANGLE'
    light_data.size = size
    light_data.size_y = size_y
    light_obj = bpy.data.objects.new(name, light_data)
    bpy.context.scene.collection.objects.link(light_obj)
    light_obj.location = location
    light_obj.rotation_euler = rotation
    return light_obj

key_light = add_area_light(
    'KeyLight',
    energy=7000,
    size=2.1,
    size_y=1.1,
    location=(2.3, -1.7, 2.4),
    rotation=(math.radians(34), math.radians(3), math.radians(22)),
)

fill_light = add_area_light(
    'FillLight',
    energy=4000,
    size=2.6,
    size_y=1.3,
    location=(-2.2, -0.7, 1.6),
    rotation=(math.radians(58), math.radians(10), math.radians(-120)),
)

back_light = add_area_light(
    'BackLight',
    energy=5000,
    size=2.3,
    size_y=0.9,
    location=(0.0, 3.4, 2.4),
    rotation=(math.radians(104), math.radians(-6), math.radians(16)),
)

rim_light = add_area_light(
    'RimLight',
    energy=7200,
    size=0.9,
    size_y=0.3,
    location=(-3.1, 1.8, 2.6),
    rotation=(math.radians(120), math.radians(-12), math.radians(-40)),
)

world = bpy.context.scene.world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.01, 0.012, 0.015, 1.0)
bg.inputs[1].default_value = 1.3

# Render settings
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 240
scene.cycles.use_adaptive_sampling = True
scene.cycles.use_light_tree = True
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'

# Output directory
output_dir = resolve_path('.')
os.makedirs(output_dir, exist_ok=True)

# Animate rotation with tilt
num_frames = 36
base_tilt_x = math.radians(-18)  # lean towards camera for sideways look
base_tilt_z = math.radians(-12)
obj.rotation_euler = (base_tilt_x, 0, base_tilt_z)

for i in range(num_frames):
    angle = (2 * math.pi * i) / num_frames
    pivot.rotation_euler = (0, 0, angle)
    
    frame_name = f'brake-rotor-{i:03d}.png'
    scene.render.filepath = os.path.join(output_dir, frame_name)
    bpy.ops.render.render(write_still=True)
    print(f'Rendered frame {i+1}/{num_frames}')
    
print('All frames generated successfully!')
