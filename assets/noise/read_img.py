from PIL import Image
from matplotlib import pyplot as plt
from numpy import asarray
import numpy as np
import codecs, json 
import math

size: int = 20#720//2
num_frames: int = 50
jump_size: int = 30
sub_img = np.full((num_frames, size, size), 0.0)
sub_img.astype(float)
rand_arr=np.random.rand(size, size)
for frame in range(num_frames):
    # load the image
    # image = Image.open('/home/agmui/cs/portfolio_website/assets/noise/ezgif-frame-%03d.jpg' % (frame+1))

    # convert image to numpy array
    # data = asarray(image)
    # print(data.shape)
    for i in range(size):
        for j in range(size):
            step = 2*(frame/num_frames+rand_arr[i][j])*math.pi
            # sub_img[frame][i][j] = data[i*jump_size][j*jump_size][0]
            sub_img[frame][i][j] = 20*rand_arr[i][j]*(math.sin(step)+1)
            # sub_img[frame][i][j] = 2*pow(math.e,4*rand_arr[i][j]*(math.sin(1.5*step)))

print(sub_img.shape)
# sub_img=np.random.rand(10,20,20)

# np.savetxt('output.csv', reshape, delimiter=",")

b = sub_img.tolist() # nested lists with same data, indices
# print(b)
file_path = "output.json" ## your path variable
json.dump(b, codecs.open(file_path, 'w', encoding='utf-8'), 
          separators=(',', ':'), 
          sort_keys=True, 
          indent=4) ### this saves the array in .json format
# print(sub_img)
# for i in sub_img:
#     print('[')
#     for j in i:
#         print('\t[', end='')
#         for k in j:
#             print(k, end=',')
#         print('],')
#     print('],')
    
# plt.imshow(sub_img[0], cmap='gray', vmin=0, vmax=255, interpolation='nearest')
# plt.imshow(data, cmap='gray', interpolation='nearest')
# plt.show()
