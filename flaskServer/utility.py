from datetime import datetime
import os


def get_time():
    return (str(datetime.now())[:-10]).replace(' ', '-').replace(':', '-')


def get_kernel(height, width):
    kernel_size = ((height + 15) // 16, (width + 15) // 16)
    return kernel_size


def get_width_height(patch_info):
    w_input = int(patch_info.split('x')[-1])
    h_input = int(patch_info.split('x')[0].split('_')[-1])
    return w_input,h_input


def parse_model_name(model_name):
    # Split based on underscores
    info = model_name.split('_')

    # Print the info to check what is being extracted
    # print(f"Model name info: {info}")  # Debug print

    # Extract resolution part (it should be in the second-to-last position)
    try:
        resolution = info[1]  # Modify to use the second part as resolution
        # print(f"Resolution extracted: {resolution}")  # Debug print
        h_input, w_input = resolution.split('x')  # Expected to split like 80x80
    except IndexError:
        raise ValueError(f"Failed to extract resolution from the model name: {model_name}")
    except ValueError:
        raise ValueError(f"Resolution part of the model name is incorrectly formatted: {resolution}")

    # Extract model type (assumed to be the part after last underscore before .pth)
    model_type = info[-1].split('.pth')[0]  # 'MiniFASNetV1SE' in your case
    # print(f"Model type extracted: {model_type}")  # Debug print

    # Extract scale (if it's included in the name)
    if info[0] == "org":
        scale = None
    else:
        scale = float(info[0])  # This gets the scale (like 4 in '4_0_0')

    return int(h_input), int(w_input), model_type, scale






def make_if_not_exist(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
